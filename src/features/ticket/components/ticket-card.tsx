"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TicketDetails } from "@/features/ticket/types";

type Props = {
  ticket: TicketDetails;
};

function formatAmount(amount: string | null) {
  if (!amount) return "—";
  const value = Number(amount);
  if (!Number.isFinite(value)) return `₦${amount}`;
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

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

export function TicketCard({ ticket }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    setQrCode(null);
    setQrError(null);

    QRCode.toDataURL(
      `${window.location.origin}/api/tickets/verify/${encodeURIComponent(ticket.token)}`,
      {
        margin: 1,
        width: 240,
        color: { dark: "#121B2E", light: "#FFFFFF" },
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

  async function downloadTicket() {
    const svg = ticketRef.current;
    if (!svg || !qrCode) return;

    setDownloading(true);
    let svgUrl: string | undefined;

    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      try {
        const fontCss = await embedFontFaces([fonts.display, fonts.body]);
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

      svgUrl = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(clone)], {
          type: "image/svg+xml;charset=utf-8",
        }),
      );
      const image = new Image();
      image.src = svgUrl;
      await image.decode();

      const scale = 2;
      const canvas = document.createElement("canvas");
      const { width, height } = svg.viewBox.baseVal;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Your browser could not prepare the image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Your browser could not create the image.")),
          "image/png",
        );
      });
      const url = URL.createObjectURL(png);
      const anchor = document.createElement("a");
      const safeCode = ticket.code.replace(/[^a-zA-Z0-9_-]/g, "-");
      anchor.href = url;
      anchor.download = `all-choirs-conference-2027-${safeCode}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Could not download the ticket: ${error.message}`
          : "The ticket image could not be downloaded.",
      );
    } finally {
      if (svgUrl) URL.revokeObjectURL(svgUrl);
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
  const codeFontSize = ticket.code.length > 14 ? 23 : 32;

  return (
    <figure className="space-y-4">
      <svg
        ref={ticketRef}
        xmlns="http://www.w3.org/2000/svg"
        width="1000"
        height="560"
        viewBox="0 0 1000 560"
        role="img"
        aria-label={`Conference ticket for ${ticket.fullName}`}
        className="block h-auto w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/20"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1000"
            height="560"
          >
            <rect width="1000" height="560" rx="32" fill="#ffffff" />
            <circle cx="300" cy="0" r="18" fill="#000000" />
            <circle cx="300" cy="560" r="18" fill="#000000" />
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
          <rect width="1000" height="560" fill="#0839d8" />
          <circle cx="944" cy="20" r="190" fill="#d095ff" opacity=".16" />
          <circle cx="712" cy="570" r="170" fill="#fc63c1" opacity=".12" />
          <rect
            x="300"
            width="700"
            height="560"
            fill={`url(#${dotsId})`}
            opacity=".55"
          />
        </g>

        <line
          x1="300"
          y1="26"
          x2="300"
          y2="534"
          stroke="#ffffff"
          strokeOpacity=".35"
          strokeWidth="2"
          strokeDasharray="5 9"
          strokeLinecap="round"
        />

        <rect x="40" y="88" width="220" height="220" rx="22" fill="#ffffff" />
        {qrCode ? (
          <image
            href={qrCode}
            x="58"
            y="106"
            width="184"
            height="184"
            aria-label="Ticket verification QR code"
          />
        ) : (
          <text
            x="150"
            y="198"
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
          y="342"
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
          y="378"
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
          y="410"
          textAnchor="middle"
          fontSize={codeFontSize}
          fontWeight={700}
          letterSpacing=".5"
          fill="#ffffff"
        >
          {ticket.code}
        </text>

        <text
          x="344"
          y="76"
          fontFamily={fonts.body}
          fontSize="12"
          fontWeight="700"
          letterSpacing="3"
          fill="#ffffff"
          opacity=".65"
        >
          ALL CHOIRS&apos; CONFERENCE 2027
        </text>

        <rect x="822" y="50" width="122" height="34" rx="17" fill="#d4ff00" />
        <text
          x="883"
          y="72"
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
          y="164"
          fontFamily={fonts.display}
          fontSize={themeFontSize}
          letterSpacing=".5"
          fill="#ffffff"
        >
          {theme}
        </text>
        <rect x="344" y="188" width="72" height="5" rx="2.5" fill="#d4ff00" />

        <text
          x="344"
          y="244"
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
          y="244"
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
          y1="268"
          x2="944"
          y2="268"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <text
          x="344"
          y="306"
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
          y="306"
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
          y1="330"
          x2="944"
          y2="330"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <text
          x="344"
          y="368"
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
          y="368"
          textAnchor="end"
          fontFamily={fonts.body}
          fontSize={valueFontSize(ticket.family, 16)}
          fontWeight="700"
          fill="#ffffff"
        >
          {ticket.family ?? "—"}
        </text>
        <line
          x1="344"
          y1="392"
          x2="944"
          y2="392"
          stroke="#ffffff"
          strokeOpacity=".14"
        />

        <text
          x="344"
          y="500"
          fontFamily={fonts.body}
          fontSize="10"
          fontWeight="600"
          letterSpacing="2"
          fill="#ffffff"
          opacity=".5"
        >
          PRESENT THIS PASS AT CHECK-IN
        </text>

        <text
          x="944"
          y="466"
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
          y="504"
          textAnchor="end"
          fontWeight={700}
          fontSize="28"
          fill="#d4ff00"
        >
          {formatAmount(ticket.amount)}
        </text>
      </svg>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm leading-6 text-slate-600">
          Save this ticket and present its QR code at conference check-in.
        </p>
        <button
          type="button"
          onClick={downloadTicket}
          disabled={!qrCode || downloading}
          className={cn(
            buttonVariants({ size: "lg" }),
            "shadow-lg shadow-primary/20 hover:-translate-y-0.5",
          )}
        >
          <Download size={17} />
          {qrError
            ? "Ticket unavailable"
            : downloading
              ? "Preparing download..."
              : qrCode
                ? "Download ticket (PNG)"
                : "Preparing ticket..."}
        </button>
      </div>
    </figure>
  );
}
