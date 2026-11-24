"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Settings,
  Ticket,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

const navigation = [
  {
    icon: LayoutDashboard,
    name: "Overview",
    href: "/admin#overview",
    activePath: "/admin",
  },
  {
    icon: Users,
    name: "Registrations",
    href: "/admin#registrations",
    activePath: "/admin/registrations",
  },
  {
    icon: Building2,
    name: "Assemblies",
    href: "/admin/assemblies",
    activePath: "/admin/assemblies",
  },
  {
    icon: UsersRound,
    name: "Families",
    href: "/admin/families",
    activePath: "/admin/families",
  },
  {
    icon: CreditCard,
    name: "Payments",
    href: "/admin#finance",
    activePath: "/admin/payments",
  },
  {
    icon: Ticket,
    name: "Tickets",
    href: "/admin#workspace",
    activePath: "/admin/tickets",
  },
  {
    icon: Settings,
    name: "Settings",
    href: "/admin#workspace",
    activePath: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col rounded-2xl bg-white p-4 lg:min-h-[calc(100vh-2rem)] lg:w-72 lg:p-5">
      <Link href="/" className="flex items-center gap-2.5 px-2 py-2">
        <span className="grid size-8 place-items-center rounded-xl bg-[#171923] text-white">
          <CalendarDays size={17} />
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          ACC <span className="text-[#7778e8]">Admin</span>
        </span>
      </Link>

      <p className="mb-2 mt-8 hidden px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 lg:block">
        Workspace
      </p>
      <nav
        aria-label="Admin navigation"
        className="mt-3 flex gap-1 overflow-x-auto lg:mt-0 lg:flex-col lg:overflow-visible"
      >
        {navigation.map(({ icon: Icon, name, href, activePath }) => {
          const active = pathname === activePath;
          return (
            <a
              key={name}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#f0f0ff] text-[#5556c8]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{name}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-4 hidden rounded-2xl bg-[#f6f7fb] p-4 lg:mt-auto lg:block">
        <p className="text-sm font-semibold text-slate-800">
          All Choirs&apos; Conference
        </p>
        <p className="text-xs leading-5 text-slate-500">January 8–9, 2027</p>
      </div>
    </aside>
  );
}
