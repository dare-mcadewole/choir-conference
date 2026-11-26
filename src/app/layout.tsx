import "./globals.css";
import localFont from "next/font/local";
import { createMetadata, SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const bodyFontLatin = localFont({
  src: "./fonts/ibm-plex-sans-latin.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-body-latin",
  display: "swap",
  adjustFontFallback: false,
});

const bodyFontLatinExt = localFont({
  src: "./fonts/ibm-plex-sans-latin-ext.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-body-latin-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const titleFont = localFont({
  src: "./fonts/cs-methane-regular.otf",
  variable: "--font-display",
  display: "swap",
});

export const metadata = createMetadata({ title: SITE_NAME });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        bodyFontLatin.variable,
        bodyFontLatinExt.variable,
        titleFont.variable,
      )}
    >
      <body className="bg-secondary/5">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
