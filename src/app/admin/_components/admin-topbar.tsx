import { Suspense } from "react";
import { Bell } from "lucide-react";
import { AdminSearch } from "@/app/admin/_components/admin-search";
import { ProfileDropdown } from "@/app/admin/_components/profile-dropdown";

export function AdminTopbar() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Suspense
        fallback={
          <div className="h-11 w-full max-w-md rounded-full border border-slate-100 bg-slate-50" />
        }
      >
        <AdminSearch />
      </Suspense>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-full text-slate-500"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-400 ring-2 ring-white" />
        </span>
        <ProfileDropdown />
      </div>
    </header>
  );
}
