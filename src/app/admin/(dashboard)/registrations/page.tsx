import Link from "next/link";
import { Search, Users } from "lucide-react";
import * as registrationService from "@/features/registration/service";
import { RegistrationDirectory } from "./components/registration-directory";

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [registrations, options] = await Promise.all([
    registrationService.findAdminRegistrations(q),
    registrationService.findAdminRegistrationOptions(),
  ]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7778e8]">
            Conference operations
          </p>
          <h1 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
            Registrations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Search attendee records and update registration details.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8]"
        >
          Back to overview
        </Link>
      </header>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Registration directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? `${registrations.length} matches for “${q}”`
                : `${registrations.length} registrations`}
            </p>
          </div>
          <form
            action="/admin/registrations"
            method="get"
            role="search"
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-sm"
          >
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, email, phone, or reference"
              aria-label="Search registrations"
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

        {registrations.length ? (
          <div className="mt-5">
            <RegistrationDirectory
              registrations={registrations}
              options={options}
            />
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-12 text-center">
            <Users className="mx-auto text-slate-300" size={26} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {q ? "No matching registrations" : "No registrations found"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? "Try another name, email, phone number, or reference."
                : "New attendee registrations will appear here."}
            </p>
            {q && (
              <Link
                href="/admin/registrations"
                className="mt-3 inline-block text-xs font-semibold text-[#5b5bc7] hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}
