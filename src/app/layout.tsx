import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const titleFont = localFont({
  src: "./fonts/cs-methane-regular.otf",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "All Choirs' Conference 2027",
  description:
    "THE ABLE MINISTER — a gathering of choristers in purpose and power.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(bodyFont.variable, titleFont.variable)}>
      <body className="bg-secondary/5">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
