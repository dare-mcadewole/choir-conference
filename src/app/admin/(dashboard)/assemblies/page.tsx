import Link from "next/link";
import { Building2, Search } from "lucide-react";
import * as assemblyService from "@/features/assembly/service";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { CreateAssemblyDialog } from "./components/create-assembly-dialog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Assemblies",
  description:
    "Manage conference assemblies.",
});

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const assemblies = await assemblyService.find(q);
  const activeCount = assemblies.filter((assembly) => assembly.active).length;

  return (
    <>
      <AdminPageHeader
        title="Assemblies"
        description="Manage the assemblies available for conference registrations."
      >
        <CreateAssemblyDialog />
      </AdminPageHeader>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Assembly directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? `Assemblies matching “${q}”`
                : `${assemblies.length} assemblies · ${activeCount} active`}
            </p>
          </div>
          <form
            action="/admin/assemblies"
            method="get"
            role="search"
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-xs"
          >
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search assemblies"
              aria-label="Search assemblies"
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

        {assemblies.length ? (
          <ul className="mt-5 divide-y divide-slate-100">
            {assemblies.map((assembly) => (
              <li
                key={assembly.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Building2 size={16} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-slate-800">
                      {assembly.name}
                    </h3>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                      {assembly.slug}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    assembly.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {assembly.active ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-12 text-center">
            <Building2 className="mx-auto text-slate-300" size={26} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {q ? "No matching assemblies" : "No assemblies have been added"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? "Try another search term."
                : "Create an assembly to make it available for registrations."}
            </p>
            {q && (
              <Link
                href="/admin/assemblies"
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
