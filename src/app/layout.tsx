import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "All Choirs' Conference 2027", description: "THE ABLE MINISTER — a gathering of choristers in purpose and power." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
