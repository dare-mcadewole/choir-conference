import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-admin-layout className="min-h-screen">
      {children}
    </div>
  );
}
