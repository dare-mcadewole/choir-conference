import type { ReactNode } from "react";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
