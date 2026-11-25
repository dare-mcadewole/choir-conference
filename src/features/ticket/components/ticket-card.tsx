"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import type { TicketDetails } from "@/features/ticket/types";

type Props = {
  ticket: TicketDetails;
};

export function TicketCard({ ticket }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<SVGSVGElement>(null);

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
          setQrError(
            error instanceof Error
              ? error.message
              : "Could not generate the ticket verification code.",
          );
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
    setDownloadError(null);
    let svgUrl: string | undefined;

    try {
      svgUrl = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(svg)], {
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
      if (!context) throw new Error("Your browser could not prepare the image.");
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
      setDownloadError(
        error instanceof Error
          ? error.message
          : "The ticket image could not be downloaded.",
      );
    } finally {
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      setDownloading(false);
    }
  }

  const nameFontSize =
    ticket.fullName.length > 27 ? 30 : ticket.fullName.length > 19 ? 36 : 42;

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
        className="block h-auto w-full overflow-hidden rounded-[1.75rem] shadow-2xl shadow-primary/20"
      >
        <rect width="1000" height="560" rx="32" fill="#0839d8" />
        <circle cx="934" cy="48" r="190" fill="#d095ff" opacity=".28" />
        <circle cx="670" cy="545" r="168" fill="#fc63c1" opacity=".18" />
        <circle cx="500" cy="75" r="2" fill="white" opacity=".6" />
        <circle cx="548" cy="75" r="2" fill="white" opacity=".6" />
        <circle cx="596" cy="75" r="2" fill="white" opacity=".6" />
        <path
          d="M682 0h24L540 560h-24z"
          fill="#d4ff00"
          opacity=".08"
        />
        <path
          d="M710 0h10L568 560h-10z"
          fill="#fc63c1"
          opacity=".18"
        />

        <g fontFamily="Arial, sans-serif" fill="#fff">
          <text x="64" y="74" fontSize="18" fontWeight="700" letterSpacing="3">
            ALL CHOIRS&apos; CONFERENCE
          </text>
          <rect x="64" y="97" width="104" height="34" rx="17" fill="#d4ff00" />
          <text
            x="116"
            y="120"
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            fill="#0839d8"
            letterSpacing="1"
          >
            ACC 2027
          </text>
          <text
            x="64"
            y="181"
            fontSize="38"
            fontWeight="800"
            letterSpacing="1"
          >
            THE ABLE MINISTER
          </text>
          <text
            x="64"
            y="235"
            fontSize="13"
            fontWeight="700"
            letterSpacing="3"
            fill="#d4ff00"
          >
            YOUR CONFERENCE PASS
          </text>
          <text
            x="64"
            y="292"
            fontSize="13"
            fontWeight="700"
            letterSpacing="2"
            fill="#ffffff"
            opacity=".7"
          >
            ISSUED TO
          </text>
          <text
            x="64"
            y="340"
            fontSize={nameFontSize}
            fontWeight="700"
          >
            {ticket.fullName}
          </text>
          <text
            x="64"
            y="390"
            fontSize="12"
            fontWeight="700"
            letterSpacing="2"
            fill="#ffffff"
            opacity=".7"
          >
            REGISTRATION CODE
          </text>
          <text x="64" y="423" fontSize="22" fontWeight="700" fill="#d4ff00">
            {ticket.code}
          </text>
          <text
            x="64"
            y="471"
            fontSize="12"
            fontWeight="700"
            letterSpacing="1.5"
            fill="#ffffff"
            opacity=".7"
          >
            ASSEMBLY
          </text>
          <text x="64" y="500" fontSize="16" fontWeight="700">
            {ticket.assembly ?? "—"}
          </text>
          <text
            x="355"
            y="471"
            fontSize="12"
            fontWeight="700"
            letterSpacing="1.5"
            fill="#ffffff"
            opacity=".7"
          >
            CONFERENCE FAMILY
          </text>
          <text x="355" y="500" fontSize="16" fontWeight="700">
            {ticket.family ?? "—"}
          </text>
          <text
            x="64"
            y="536"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fill="#d4ff00"
          >
            PRESENT THIS PASS AT CONFERENCE CHECK-IN
          </text>
        </g>

        <rect
          x="744"
          y="122"
          width="208"
          height="260"
          rx="24"
          fill="#ffffff"
        />
        {qrCode ? (
          <image
            href={qrCode}
            x="768"
            y="146"
            width="160"
            height="160"
            aria-label="Ticket verification QR code"
          />
        ) : (
          <text
            x="848"
            y="232"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill="#0839d8"
          >
            PREPARING QR CODE
          </text>
        )}
        <text
          x="848"
          y="340"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1.5"
          fill="#0839d8"
        >
          SCAN TO VERIFY
        </text>
        <rect x="766" y="412" width="164" height="46" rx="23" fill="#d4ff00" />
        <text
          x="848"
          y="441"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="15"
          fontWeight="700"
          letterSpacing="1"
          fill="#0839d8"
        >
          VALID ENTRY
        </text>
        <circle cx="939" cy="497" r="8" fill="#fc63c1" />
        <circle cx="963" cy="497" r="8" fill="#d095ff" />
      </svg>
      {qrError && (
        <p className="text-sm text-red-700" role="alert">
          Could not prepare the downloadable ticket: {qrError}
        </p>
      )}
      {downloadError && (
        <p className="text-sm text-red-700" role="alert">
          Could not download the ticket: {downloadError}
        </p>
      )}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-slate-600">
          Save this ticket and present its QR code at conference check-in.
        </p>
        <button
          type="button"
          onClick={downloadTicket}
          disabled={!qrCode || downloading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
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
