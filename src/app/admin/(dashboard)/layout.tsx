import type { ReactNode } from "react";
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { AdminTopbar } from "@/app/admin/_components/admin-topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-primary-50 grid min-h-screen grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-4">
      <AdminSidebar />
      <section className="min-w-0 rounded-2xl bg-white p-4 sm:p-6 lg:col-start-2 lg:p-8">
        <AdminTopbar />
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
