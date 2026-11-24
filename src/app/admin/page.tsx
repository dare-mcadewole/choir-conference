import Link from "next/link";
import {
  Building2,
  CreditCard,
  Settings,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";
import * as dashboardService from "@/features/dashboard/service";

async function overview() {
  try {
    return await dashboardService.findAdminOverview();
  } catch {
    return {
      all: 0,
      confirmed: 0,
      pending: 0,
      paid: 0,
      revenue: "0",
      assemblies: 0,
    };
  }
}
export default async function AdminPage() {
  const data = await overview();
  const nav = [
    {
      icon: Users,
      name: "Registrations",
      detail: "Search, review and export attendee records",
    },
    {
      icon: Building2,
      name: "Assemblies & families",
      detail: "Maintain family assignments and WhatsApp links",
    },
    {
      icon: UserRound,
      name: "Speakers & institutions",
      detail: "Publish speakers and manage student options",
    },
    {
      icon: Ticket,
      name: "Tickets & payments",
      detail: "Review tickets, transactions and reconciliation",
    },
    {
      icon: Settings,
      name: "Conference settings",
      detail: "Registration windows, pricing and communication",
    },
  ];
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="page-shell flex h-16 items-center justify-between">
          <Link className="font-display text-lg" href="/">
            ACC 2027 <span className="text-wine">/ Admin</span>
          </Link>
          <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-ink">
            Administration
          </span>
        </div>
      </header>
      <div className="page-shell py-10">
        <p className="eyebrow">Command centre</p>
        <h1 className="mt-3 font-display text-4xl">Conference overview</h1>
        <p className="mt-2 text-slate-600">
          Live totals from the registration database.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Total registrations" value={data.all} />
          <Metric label="Confirmed" value={data.confirmed} />
          <Metric label="Pending payment" value={data.pending} />
          <Metric label="Paid" value={data.paid} />
          <Metric label="Active assemblies" value={data.assemblies} />
        </div>
        <section className="mt-8 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl">Revenue</h2>
              <p className="mt-1 text-sm text-slate-500">
                Verified successful transactions only
              </p>
            </div>
            <p className="font-display text-3xl">
              ₦{Number(data.revenue).toLocaleString("en-NG")}
            </p>
          </div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {nav.map(({ icon: Icon, name, detail }) => (
            <div key={name} className="card flex items-start gap-4 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-wine/10 text-wine">
                <Icon size={20} />
              </span>
              <div>
                <h2 className="font-semibold">{name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </section>
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Connect your production authentication provider before granting team
          access to this administration area. The dashboard intentionally has no
          default credentials or anonymous write actions.
        </p>
      </div>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
