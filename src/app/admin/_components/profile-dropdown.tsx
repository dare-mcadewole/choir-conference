import Link from "next/link";
import { ChevronDown, Globe2, LayoutDashboard, LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/admin/actions";
import { getAdminUser } from "@/lib/supabase/server";
import { getInitials } from "@/features/shared/utils/strings";

export async function ProfileDropdown() {
  const user = await getAdminUser();

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <span className="grid size-9 place-items-center rounded-full bg-[#e7e8ff] text-xs font-bold text-[#5b5bc7]">
          {getInitials(user?.email ?? "")}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-xs font-semibold text-slate-800">
            {user?.user_metadata?.name ?? user?.email ?? "Administrator"}
          </span>
        </span>
        <ChevronDown
          size={14}
          className="text-slate-400 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account
        </p>
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <LayoutDashboard size={15} /> Dashboard
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Globe2 size={15} /> View conference site
        </Link>

        <form action={signOutAdmin}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-slate-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
