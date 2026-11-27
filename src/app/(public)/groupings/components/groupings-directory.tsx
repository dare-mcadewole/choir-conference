"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Building2,
  MessageCircle,
  Music,
  Music2,
  Search,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const FAMILY_ICONS: Record<string, LucideIcon> = {
  AudioLines,
  Music,
  Music2,
  Users,
};

export type GroupingFamily = {
  id: string;
  name: string;
  alias: string | null;
  icon: string;
  description: string | null;
  whatsappUrl: string | null;
  assemblies: string[];
  registrationCount: number;
};

export function GroupingsDirectory({ groups }: { groups: GroupingFamily[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? groups
        .flatMap((group) => {
          const familyMatches =
            group.name.toLowerCase().includes(normalized) ||
            (group.alias?.toLowerCase().includes(normalized) ?? false);

          return group.assemblies
            .filter(
              (assembly) =>
                familyMatches || assembly.toLowerCase().includes(normalized),
            )
            .map((assembly) => ({ assembly, group }));
        })
        .sort((a, b) => a.assembly.localeCompare(b.assembly))
    : [];

  if (!groups.length) {
    return (
      <section className="rounded-2xl border-hairline border-primary-100 bg-white p-8 text-center shadow-xl shadow-zinc-100 sm:p-10">
        <UsersRound className="mx-auto text-slate-300" size={28} />
        <h2 className="mt-4 font-display text-2xl uppercase text-slate-900">
          No family directory yet
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Music game families and their assemblies will appear here once they
          are configured.
        </p>
      </section>
    );
  }

  return (
    <div>
      <section
        aria-labelledby="assembly-search-title"
        className="rounded-2xl border-hairline border-primary-100 bg-white p-5 shadow-xl shadow-zinc-100 sm:p-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-secondary-700">
              Family directory
            </p>
            <h2
              id="assembly-search-title"
              className="mt-1 font-display text-2xl uppercase text-slate-900"
            >
              Find your assembly
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Search to see which family your assembly belongs to.
          </p>
        </div>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <Input
            id="assembly-search"
            aria-label="Find your assembly"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search by assembly name..."
            autoComplete="off"
            className="h-12 rounded-xl border-primary-100 bg-white pl-10 pr-10 text-sm focus-visible:ring-primary/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {normalized ? (
        <section
          aria-labelledby="search-results-title"
          className="mt-5 overflow-hidden rounded-2xl border-hairline border-primary-100 bg-white shadow-xl shadow-zinc-100"
        >
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2
              id="search-results-title"
              className="font-display text-xl uppercase text-slate-900"
            >
              Search results
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {results.length} matching{" "}
              {results.length === 1 ? "assembly" : "assemblies"} for “
              {query.trim()}”
            </p>
          </div>

          {results.length ? (
            <ul className="divide-y divide-slate-100">
              {results.map(({ assembly, group }) => {
                const Icon = FAMILY_ICONS[group.icon] ?? UsersRound;

                return (
                  <li
                    key={`${group.id}-${assembly}`}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-slate-800">
                      <Building2
                        size={15}
                        className="shrink-0 text-slate-400"
                      />
                      <span className="truncate">{assembly}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                      <span className="grid size-7 place-items-center rounded-lg bg-primary-50 text-primary-600">
                        <Icon size={14} />
                      </span>
                      <span className="font-semibold text-slate-700">
                        {group.name}
                      </span>
                      {group.alias && (
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {group.alias}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <Search className="mx-auto text-slate-300" size={26} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No assembly found for “{query.trim()}”
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                Check the spelling, or contact the conference team if your
                assembly is missing.
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const Icon = FAMILY_ICONS[group.icon] ?? UsersRound;

            return (
              <section
                key={group.id}
                aria-labelledby={`group-${group.id}`}
                className="overflow-hidden rounded-2xl border-hairline border-primary-100 bg-white shadow-xl shadow-zinc-100"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          id={`group-${group.id}`}
                          className="font-display text-xl uppercase text-slate-900"
                        >
                          {group.name}
                        </h2>
                        {group.alias && (
                          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            {group.alias}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                        {group.assemblies.length}{" "}
                        {group.assemblies.length === 1
                          ? "assembly"
                          : "assemblies"}
                        {group.registrationCount > 0 &&
                          ` · ${group.registrationCount} registrations`}
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 py-2 sm:px-6">
                  {group.assemblies.map((assembly) => (
                    <li
                      key={assembly}
                      className="flex items-center gap-2.5 py-2.5 text-sm text-slate-700"
                    >
                      <Building2
                        size={14}
                        className="shrink-0 text-slate-300"
                      />
                      {assembly}
                    </li>
                  ))}
                  {!group.assemblies.length && (
                    <li className="py-6 text-center text-xs text-slate-500">
                      No assemblies assigned yet.
                    </li>
                  )}
                </ul>

                {group.whatsappUrl && (
                  <div className="border-t border-slate-100 px-5 py-3 text-xs sm:px-6">
                    <a
                      href={group.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-primary-700 transition hover:text-primary-800"
                    >
                      <MessageCircle size={14} />
                      Join the {group.alias ?? group.name} WhatsApp group
                    </a>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-dashed border-primary-100 bg-white/60 px-5 py-4 text-center text-xs leading-5 text-slate-500">
        Can&apos;t find your assembly? It may not be assigned to a family yet.
        Contact the conference team for help.
      </div>
    </div>
  );
}
