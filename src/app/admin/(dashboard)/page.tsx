import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MoreHorizontal,
  Settings,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";
import * as dashboardService from "@/features/dashboard/service";
import { getInitials } from "@/features/shared/utils/strings";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { RegistrationStatus } from "@/app/admin/_components/registration-status";
import { StatusSummary } from "@/app/admin/_components/status-summary";
import { WorkspaceCard } from "@/app/admin/_components/workspace-card";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [data, registrations] = await Promise.all([
    overview(),
    dashboardService.findRecentRegistrations(q),
  ]);
  const confirmedRate = data.all
    ? Math.round((Number(data.confirmed) / Number(data.all)) * 100)
    : 0;
  const metrics = [
    {
      icon: Users,
      label: "Total registrations",
      value: Number(data.all).toLocaleString(),
      detail: `${Number(data.confirmed).toLocaleString()} confirmed`,
      color: "bg-[#eeeefe] text-[#7778e8]",
    },
    {
      icon: CheckCircle2,
      label: "Confirmed",
      value: Number(data.confirmed).toLocaleString(),
      detail: `${confirmedRate}% of all registrations`,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Activity,
      label: "Pending payment",
      value: Number(data.pending).toLocaleString(),
      detail: "Awaiting payment confirmation",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: CreditCard,
      label: "Verified revenue",
      value: `₦${Number(data.revenue).toLocaleString("en-NG")}`,
      detail: `${Number(data.paid).toLocaleString()} successful payments`,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <>
      <div id="overview" className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7778e8]">
            Command centre
          </p>
          <h1 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
            Conference overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A live look at registrations and conference operations.
          </p>
        </div>
        <Link
          href="/statistics"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8]"
        >
          Public statistics <ArrowUpRight size={14} />
        </Link>
      </div>

      <section
        aria-label="Conference metrics"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,.85fr)]">
        <section
          id="registrations"
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {q ? "Registration search" : "Recent registrations"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {q
                  ? `Showing matches for “${q}”`
                  : "Latest attendee activity"}
              </p>
            </div>
            <MoreHorizontal size={19} className="text-slate-400" />
          </div>

          {registrations.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {registrations.map((registration) => (
                <article
                  key={registration.id}
                  className="rounded-xl border border-slate-100 bg-[#fbfcff] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eeeefe] text-sm font-semibold text-[#7778e8]">
                        {getInitials(registration.fullName)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">
                          {registration.fullName}
                        </h3>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {registration.email}
                        </p>
                      </div>
                    </div>
                    <RegistrationStatus status={registration.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <span className="truncate">
                      {registration.assembly ?? "Assembly not assigned"}
                    </span>
                    <span className="ml-3 shrink-0">
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                      }).format(registration.createdAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-10 text-center">
              <Users className="mx-auto text-slate-300" size={24} />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No registrations found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {q
                  ? "Try another name or email address."
                  : "New attendee registrations will appear here."}
              </p>
              {q && (
                <Link
                  href="/admin"
                  className="mt-3 inline-block text-xs font-semibold text-[#5b5bc7] hover:underline"
                >
                  Clear search
                </Link>
              )}
            </div>
          )}
        </section>

        <section
          id="finance"
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Registration status
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Current attendee breakdown
              </p>
            </div>
            <MoreHorizontal size={19} className="text-slate-400" />
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <p className="text-4xl font-semibold tracking-tight text-slate-900">
                {Number(data.all).toLocaleString()}
              </p>
              <span className="pb-1 text-xs text-slate-500">
                total attendees
              </span>
            </div>
            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-amber-100"
              aria-label={`${confirmedRate}% confirmed`}
              role="img"
            >
              <div
                className="h-full rounded-full bg-[#8585f0]"
                style={{ width: `${confirmedRate}%` }}
              />
            </div>
            <div className="mt-5 space-y-4">
              <StatusSummary
                label="Confirmed"
                value={Number(data.confirmed)}
                color="bg-[#8585f0]"
              />
              <StatusSummary
                label="Pending payment"
                value={Number(data.pending)}
                color="bg-amber-400"
              />
              <StatusSummary
                label="Assemblies represented"
                value={Number(data.assemblies)}
                color="bg-slate-300"
              />
            </div>
          </div>
          <div className="mt-7 rounded-xl bg-[#f6f7ff] p-4">
            <div className="flex items-center gap-2 text-[#6263d2]">
              <CalendarDays size={16} />
              <span className="text-xs font-semibold">January 8–9, 2027</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              All Choirs&apos; Conference · The Able Minister
            </p>
          </div>
        </section>
      </div>

      <section id="workspace" className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Conference workspace
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Common areas for conference administration
            </p>
          </div>
          <span className="hidden text-[11px] text-slate-400 sm:inline">
            More tools coming soon
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <WorkspaceCard
            icon={Building2}
            title="Assemblies & families"
            detail="Manage assembly assignments"
            color="bg-blue-50 text-blue-600"
          />
          <WorkspaceCard
            icon={UserRound}
            title="Speakers & institutions"
            detail="Maintain conference directory"
            color="bg-violet-50 text-violet-600"
          />
          <WorkspaceCard
            icon={Ticket}
            title="Tickets & payments"
            detail="Review tickets and transactions"
            color="bg-amber-50 text-amber-600"
          />
          <WorkspaceCard
            icon={Settings}
            title="Conference settings"
            detail="Event details and registration"
            color="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-900">
        Preview only: configure an authentication provider before granting
        access to administrator tools.
      </p>
    </>
  );
}
