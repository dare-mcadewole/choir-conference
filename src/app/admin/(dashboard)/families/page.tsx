import Link from "next/link";
import {
  Building2,
  Search,
  Users,
  UsersRound,
} from "lucide-react";
import * as familyService from "@/features/family/service";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { FamilyCard } from "./components/family-card";

export default async function FamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const families = await familyService.find(q);
  const assignmentOptions = await familyService.findAssignmentOptions(
    families.map((family) => family.id),
  );
  const activeFamilies = families.filter((family) => family.active).length;
  const assignedAssemblies = families.reduce(
    (total, family) => total + Number(family.assemblyCount),
    0,
  );
  const registrations = families.reduce(
    (total, family) => total + Number(family.registrationCount),
    0,
  );

  const metrics = [
    {
      icon: UsersRound,
      label: "Total families",
      value: families.length.toLocaleString(),
      detail: `${activeFamilies} active`,
      color: "bg-[#eeeefe] text-[#7778e8]",
    },
    {
      icon: Building2,
      label: "Assigned assemblies",
      value: assignedAssemblies.toLocaleString(),
      detail: "Across all conference families",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Users,
      label: "Registrations",
      value: registrations.toLocaleString(),
      detail: "Attendees assigned to families",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7778e8]">
            Conference setup
          </p>
          <h1 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
            Families
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            View family groups, their assigned assemblies, and attendee totals.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8]"
        >
          Back to overview
        </Link>
      </header>

      <section
        aria-label="Family metrics"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Family directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? `Families matching “${q}”`
                : "Conference families and their assembly assignments"}
            </p>
          </div>
          <form
            action="/admin/families"
            method="get"
            role="search"
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-xs"
          >
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search families"
              aria-label="Search families"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="text-xs font-semibold text-[#6263d2] hover:text-[#4546b5]"
            >
              Search
            </button>
          </form>
        </div>

        {families.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {families.map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
                availableAssemblies={
                  assignmentOptions.availableByFamily[family.id] ?? []
                }
                assignedAssemblies={
                  assignmentOptions.assignedByFamily[family.id] ?? []
                }
                conferenceAvailable={assignmentOptions.conferenceAvailable}
                activeAssemblyCount={assignmentOptions.activeAssemblyCount}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-12 text-center">
            <UsersRound className="mx-auto text-slate-300" size={26} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {q ? "No matching families" : "No families have been added"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? "Try another search term."
                : "Families will appear here once they are configured."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
