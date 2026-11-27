"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { TicketDetails } from "@/features/ticket/types";

type Props = {
  ticket: TicketDetails;
};

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
const IS_TEST_ENVIRONMENT =
  APP_ENV === "test" || process.env.NODE_ENV !== "production";

function valueFontSize(value: string | null, base: number) {
  const length = value?.length ?? 0;
  if (length > 48) return base - 6;
  if (length > 40) return base - 4;
  if (length > 32) return base - 2;
  return base;
}

const GENERIC_FONTS = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

function fontFamilyNames(stack: string) {
  return stack
    .split(",")
    .map((family) => family.trim().replace(/^["']|["']$/g, ""))
    .filter((family) => family && !GENERIC_FONTS.has(family.toLowerCase()));
}

async function embedFontFaces(fontStacks: string[]) {
  const wanted = new Set(fontStacks.flatMap(fontFamilyNames));
  const rules: CSSFontFaceRule[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(cssRules)) {
      if (rule instanceof CSSFontFaceRule) rules.push(rule);
    }
  }

  const matching = rules.filter((rule) =>
    wanted.has(
      rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim(),
    ),
  );

  const inlined = new Map<string, string>();

  async function inlineFontUrl(url: string) {
    const cached = inlined.get(url);
    if (cached) return cached;

    const response = await fetch(new URL(url, document.baseURI).href);
    if (!response.ok) throw new Error("Could not load a ticket font.");
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    inlined.set(url, dataUrl);
    return dataUrl;
  }

  const css = await Promise.all(
    matching.map(async (rule) => {
      let text = rule.cssText;
      for (const match of text.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
        const url = match[2];
        if (!url || url.startsWith("data:")) continue;
        text = text.replace(match[0], `url("${await inlineFontUrl(url)}")`);
      }
      return text;
    }),
  );

  return css.join("\n");
}

function ticketFileName(code: string) {
  return `all-choirs-conference-2027-${code.replace(/[^a-zA-Z0-9_-]/g, "-")}.png`;
}

async function renderTicketPng(svg: SVGSVGElement, fontStacks: string[]) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  try {
    const fontCss = await embedFontFaces(fontStacks);
    if (fontCss) {
      const style = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style",
      );
      style.textContent = fontCss;
      clone.insertBefore(style, clone.firstChild);
    }
  } catch {
    /* fall back to the declared font stacks */
  }

  const svgUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml;charset=utf-8",
    }),
  );

  try {
    const image = new Image();
    image.src = svgUrl;
    await image.decode();

    const scale = 2;
    const canvas = document.createElement("canvas");
    const { width, height } = svg.viewBox.baseVal;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Your browser could not create the image.")),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function downloadWithAnchor(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openTicketImage(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 300_000);
  toast.info("Press and hold the ticket image, then choose Save to Photos.");
}

export function TicketCard({ ticket }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [fonts, setFonts] = useState({
    display: "Arial, sans-serif",
    body: "Arial, sans-serif",
  });
  const ticketRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue("--font-display").trim();
    const body = styles.getPropertyValue("--font-body").trim();
    setFonts({
      display: display ? `${display}, sans-serif` : "Arial, sans-serif",
      body: body ? `${body}, sans-serif` : "Arial, sans-serif",
    });
    setFontsReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setQrCode(null);
    setQrError(null);

    QRCode.toDataURL(
      `${window.location.origin}/ticket/${encodeURIComponent(ticket.token)}`,
      {
        margin: 0.25,
        width: 240,
        color: {
          dark: "#121B2E",
          light: "#FFFFFF",
        },
      },
    )
      .then((dataUrl) => {
        if (!cancelled) setQrCode(dataUrl);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not generate the ticket verification code.";
          setQrError(message);
          toast.error(`Could not prepare the ticket: ${message}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticket.token]);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIos(
      /iP(hone|ad|od)/i.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
  }, []);

  useEffect(() => {
    if (!isIos || !qrCode || !fontsReady) return;
    const svg = ticketRef.current;
    if (!svg) return;

    let cancelled = false;
    setTicketFile(null);

    renderTicketPng(svg, [fonts.display, fonts.body])
      .then((png) => {
        if (cancelled) return;
        setTicketFile(
          new File([png], ticketFileName(ticket.code), { type: "image/png" }),
        );
      })
      .catch(() => {
        /* the save action retries on demand */
      });

    return () => {
      cancelled = true;
    };
  }, [isIos, qrCode, fontsReady, fonts.display, fonts.body, ticket.code]);

  async function downloadTicket() {
    const svg = ticketRef.current;
    if (!svg || !qrCode) return;

    if (isIos && ticketFile) {
      openTicketImage(ticketFile);
      return;
    }

    setDownloading(true);

    try {
      if (isIos) {
        const preview = window.open("", "_blank");
        const file = new File(
          [await renderTicketPng(svg, [fonts.display, fonts.body])],
          ticketFileName(ticket.code),
          { type: "image/png" },
        );

        if (preview) {
          const url = URL.createObjectURL(file);
          preview.location.href = url;
          window.setTimeout(() => URL.revokeObjectURL(url), 300_000);
          toast.info(
            "Press and hold the ticket image, then choose Save to Photos.",
          );
        } else {
          downloadWithAnchor(file, file.name);
        }
        return;
      }

      const file = new File(
        [await renderTicketPng(svg, [fonts.display, fonts.body])],
        ticketFileName(ticket.code),
        { type: "image/png" },
      );
      downloadWithAnchor(file, file.name);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Could not open the ticket: ${error.message}`
          : "The ticket image could not be opened.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `ticket-mask-${instanceId}`;
  const dotsId = `ticket-dots-${instanceId}`;

  const theme = (ticket.theme?.trim() || "The Able Minister").toUpperCase();
  const themeFontSize =
    theme.length > 40
      ? 22
      : theme.length > 32
        ? 26
        : theme.length > 26
          ? 30
          : theme.length > 22
            ? 36
            : theme.length > 17
              ? 42
              : 48;
  const anchorScripture = ticket.anchorScripture?.trim().toUpperCase() ?? "";
  const themeRuleY = anchorScripture ? 176 : 162;
  const codeFontSize = ticket.code.length > 14 ? 24 : 32;
  const familyAlias = ticket.familyAlias?.trim();
  const familyLabel = ticket.family
    ? familyAlias && familyAlias !== ticket.family
      ? `${ticket.family} (${familyAlias})`
      : ticket.family
    : familyAlias || null;
  const statusLabel = ticket.registrationStatus
    .replace(/_/g, " ")
    .toUpperCase();
  const statusColor =
    ticket.registrationStatus === "CONFIRMED"
      ? "#d4ff00"
      : ticket.registrationStatus === "PENDING_PAYMENT"
        ? "#ffc24b"
        : "#ff8a8a";
  const saveLabel = qrError
    ? "Ticket unavailable"
    : downloading
      ? isIos
        ? "Preparing image..."
        : "Preparing download..."
      : qrCode
        ? "Download ticket (PNG)"
        : "Preparing ticket...";

  return (
    <figure className="space-y-4">
      <svg
        ref={ticketRef}
        xmlns="http://www.w3.org/2000/svg"
        width="1000"
        height="500"
        viewBox="0 0 1000 500"
        role="img"
        aria-label={`${IS_TEST_ENVIRONMENT ? "Test ticket" : "Conference ticket"} for ${ticket.fullName}`}
        className="lg:scale-75 block h-auto w-full overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[1.95rem] shadow-2xl shadow-primary/20"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1000"
            height="500"
          >
            <rect width="1000" height="500" rx="28" fill="#ffffff" />
            <circle cx="300" cy="0" r="16" fill="#000000" />
            <circle cx="300" cy="500" r="16" fill="#000000" />
          </mask>
          <pattern
            id={dotsId}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity=".18" />
          </pattern>
        </defs>

        <g mask={`url(#${maskId})`}>
          <rect width="1000" height="500" fill="#0839d8" />
          <circle cx="944" cy="20" r="190" fill="#d095ff" opacity=".16" />
          <circle cx="712" cy="520" r="160" fill="#fc63c1" opacity=".12" />
          <rect
            x="300"
            width="700"
            height="500"
            fill={`url(#${dotsId})`}
            opacity=".55"
          />
        </g>

        {IS_TEST_ENVIRONMENT && (
          <text
            x="644"
            y="270"
            textAnchor="middle"
            fontFamily={fonts.display}
            fontSize="140"
            letterSpacing="20"
            fill="#ffffff"
            fillOpacity=".1"
            transform="rotate(-18 644 270)"
            aria-hidden="true"
          >
            TEST
          </text>
        )}

        <line
          x1="300"
          y1="24"
          x2="300"
          y2="476"
          stroke="#ffffff"
          strokeOpacity=".35"
          strokeWidth="2"
          strokeDasharray="5 9"
          strokeLinecap="round"
        />

        <rect x="50" y="106" width="200" height="200" rx="20" fill="#ffffff" />
        {qrCode ? (
          <image
            href={qrCode}
            x="66"
            y="122"
            width="168"
            height="168"
            aria-label="Ticket verification QR code"
          />
        ) : (
          <text
            x="150"
            y="206"
            textAnchor="middle"
            fontFamily={fonts.body}
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.5"
            fill="#0839d8"
          >
            {qrError ? "QR UNAVAILABLE" : "PREPARING QR CODE"}
          </text>
        )}

        <text
          x="150"
          y="330"
          textAnchor="middle"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.2"
          fill="#ffffff"
          opacity=".55"
        >
          SCAN TO VERIFY
        </text>
        <text
          x="150"
          y="360"
          textAnchor="middle"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.2"
          fill="#d4ff00"
        >
          REGISTRATION CODE
        </text>
        <text
          x="150"
          y="394"
          textAnchor="middle"
          fontFamily={fonts.body}
          fontSize={codeFontSize}
          fontWeight={700}
          letterSpacing=".5"
          fill="#ffffff"
        >
          {ticket.code}
        </text>

        <text
          x="344"
          y="64"
          fontFamily={fonts.body}
          fontSize="12"
          fontWeight="700"
          letterSpacing="3"
          fill="#ffffff"
          opacity=".65"
        >
          ALL CHOIRS&apos; CONFERENCE 2027
        </text>

        <rect x="822" y="40" width="122" height="32" rx="16" fill="#d4ff00" />
        <text
          x="883"
          y="61"
          textAnchor="middle"
          fontFamily={fonts.body}
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.2"
          fill="#0839d8"
        >
          #ACC2027
        </text>

        <text
          x="344"
          y="142"
          fontFamily={fonts.display}
          fontSize={themeFontSize}
          letterSpacing=".5"
          fill="#ffffff"
        >
          {theme}
        </text>
        {anchorScripture && (
          <text
            x="344"
            y="164"
            fontFamily={fonts.body}
            fontSize="10"
            fontWeight="700"
            letterSpacing="2.4"
            fill="#ffffff"
            opacity=".7"
          >
            {anchorScripture}
          </text>
        )}
        <rect
          x="344"
          y={themeRuleY}
          width="48"
          height="2"
          rx="2"
          fill="#d4ff00"
        />

        <text
          x="344"
          y="204"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.2"
          fill="#ffffff"
          opacity=".5"
        >
          NAME
        </text>
        <text
          x="944"
          y="204"
          textAnchor="end"
          fontFamily={fonts.body}
          fontSize={valueFontSize(ticket.fullName, 18)}
          fontWeight="700"
          fill="#ffffff"
        >
          {ticket.fullName}
        </text>
        <line
          x1="344"
          y1="226"
          x2="944"
          y2="226"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <text
          x="344"
          y="258"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.2"
          fill="#ffffff"
          opacity=".5"
        >
          ASSEMBLY
        </text>
        <text
          x="944"
          y="258"
          textAnchor="end"
          fontFamily={fonts.body}
          fontSize={valueFontSize(ticket.assembly, 16)}
          fontWeight="700"
          fill="#ffffff"
        >
          {ticket.assembly ?? "—"}
        </text>
        <line
          x1="344"
          y1="280"
          x2="944"
          y2="280"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <text
          x="344"
          y="312"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.2"
          fill="#ffffff"
          opacity=".5"
        >
          MUSIC GAMES FAMILY
        </text>
        <text
          x="944"
          y="312"
          textAnchor="end"
          fontFamily={fonts.body}
          fontSize={valueFontSize(familyLabel, 16)}
          fontWeight="700"
          fill="#ffffff"
        >
          {familyLabel ?? "—"}
        </text>
        <line
          x1="344"
          y1="334"
          x2="944"
          y2="334"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <circle cx="347" cy="426" r="2.5" fill={statusColor} />
        <text
          x="356"
          y="430"
          fontFamily={fonts.body}
          fontSize="9"
          fontWeight="600"
          letterSpacing="1.6"
          fill="#ffffff"
          fillOpacity=".5"
        >
          REGISTRATION{" "}
          <tspan fill={statusColor} fillOpacity="1" fontWeight="700">
            {statusLabel}
          </tspan>
        </text>

        <text
          x="344"
          y="448"
          fontFamily={fonts.body}
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="2"
          fill="#ffffff"
          opacity=".5"
        >
          PRESENT THIS PASS AT CHECK-IN
        </text>

        <text
          x="944"
          y="412"
          textAnchor="end"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.2"
          fill="#ffffff"
          opacity=".55"
        >
          TICKET AMOUNT
        </text>
        <text
          x="944"
          y="448"
          textAnchor="end"
          fontFamily={fonts.body}
          fontWeight={700}
          fontSize="26"
          fill="#d4ff00"
        >
          {formatCurrency(ticket.amount)}
        </text>
      </svg>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm leading-6 text-slate-600">
          {isIos ? (
            <>
              Tap <strong>Download ticket</strong>, then press and hold the
              image and choose <strong>Save to Photos</strong>.
            </>
          ) : (
            <>
              <strong>Save</strong> or <strong>Screenshot</strong> this ticket
              and present its QR code at conference check-in.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={downloadTicket}
          disabled={!qrCode || downloading}
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-slate-900 hover:bg-slate-700 text-secondary-100",
            "shadow-lg shadow-primary/20 hover:-translate-y-0.5",
          )}
        >
          {isIos ? <ExternalLink size={17} /> : <Download size={17} />}
          {saveLabel}
        </button>
      </div>
    </figure>
  );
}
