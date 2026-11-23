import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const methane = localFont({
  src: "./fonts/cs-methane-regular.otf",
  variable: "--font-methane",
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
    <html lang="en" className={cn(inter.variable, methane.variable)}>
      <body>{children}</body>
    </html>
  );
}
