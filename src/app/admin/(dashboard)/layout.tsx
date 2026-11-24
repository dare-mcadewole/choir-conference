import type { ReactNode } from "react";
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { AdminTopbar } from "@/app/admin/_components/admin-topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-primary-50 flex min-h-screen flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:gap-4">
      <AdminSidebar />
      <section className="min-w-0 flex-1 rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
        <AdminTopbar />
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
