import Link from "next/link";
import {
  AudioLines,
  Building2,
  ExternalLink,
  Music,
  Music2,
  Search,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import * as familyService from "@/features/family/service";
import { MetricCard } from "@/app/admin/_components/metric-card";

const familyIcons: Record<string, LucideIcon> = {
  AudioLines,
  Music,
  Music2,
  Users,
};

export default async function FamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const families = await familyService.find(q);
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
            {families.map((family) => {
              const Icon = familyIcons[family.icon] ?? UsersRound;
              return (
                <article
                  key={family.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-[#fbfcff] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eeeefe] text-[#7778e8]">
                      <Icon size={20} />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        family.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {family.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {family.name}
                  </h3>
                  {family.alias && (
                    <p className="mt-1 text-xs text-slate-500">
                      {family.alias}
                    </p>
                  )}
                  <p className="mt-3 min-h-10 text-xs leading-5 text-slate-500">
                    {family.description ?? "No family description provided."}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-700">
                        Assemblies
                      </span>
                      <span className="text-slate-500">
                        {family.assemblyCount}
                      </span>
                    </div>
                    {family.assemblyNames.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {family.assemblyNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-slate-400">
                        No assemblies assigned
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Registrations
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {Number(family.registrationCount).toLocaleString()}
                      </p>
                    </div>
                    {family.whatsappUrl ? (
                      <a
                        href={family.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f0ff] px-3 py-2 text-[10px] font-semibold text-[#5556c8] hover:bg-[#e6e6ff]"
                      >
                        WhatsApp group <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        No group link
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
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
