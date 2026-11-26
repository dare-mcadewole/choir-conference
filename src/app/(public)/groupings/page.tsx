import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as familyService from "@/features/family/service";
import { createMetadata } from "@/lib/seo";
import {
  GroupingsDirectory,
  type GroupingFamily,
} from "./components/groupings-directory";

export const metadata = createMetadata({
  title: "Music Games Groupings",
  description:
    "Find which music game family your assembly belongs to at the All Choirs' Conference 2027.",
});

export const dynamic = "force-dynamic";

export default async function GroupingsPage() {
  let groups: GroupingFamily[] = [];
  try {
    const families = (await familyService.find()).filter(
      (family) => family.active,
    );
    groups = families.map((family) => ({
      id: family.id,
      name: family.name,
      alias: family.alias,
      icon: family.icon,
      description: family.description,
      whatsappUrl: family.whatsappUrl,
      assemblies: [...family.assemblyNames].sort((a, b) =>
        a.localeCompare(b),
      ),
      registrationCount: Number(family.registrationCount),
    }));
  } catch {
    /* The empty state below covers an unavailable directory. */
  }

  const totalAssemblies = groups.reduce(
    (total, group) => total + group.assemblies.length,
    0,
  );
  const totalRegistrations = groups.reduce(
    (total, group) => total + group.registrationCount,
    0,
  );

  return (
    <main className="min-h-screen bg-secondary/5">
      <section className="relative isolate overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]" />
        <div className="pointer-events-none absolute -right-20 -top-16 size-72 rounded-full bg-[#d095ff]/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-20 top-[65%] size-48 rounded-full bg-[#fc63c1] opacity-20 blur-2xl" />

        <div className="page-shell relative py-12 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-secondary"
          >
            <ArrowLeft size={16} /> Back to conference
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-secondary/40 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-secondary sm:text-xs">
                Family directory
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-4xl uppercase leading-[.95] sm:text-5xl md:text-6xl">
                Music Games <span className="text-secondary">Groupings</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Find your assembly and see which music game family it belongs
                to.
              </p>
            </div>

            <dl className="flex flex-wrap gap-3">
              <div className="min-w-24 rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <dt className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
                  Families
                </dt>
                <dd className="mt-1 font-display text-3xl text-white">
                  {groups.length}
                </dd>
              </div>
              <div className="min-w-28 rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <dt className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
                  Assemblies
                </dt>
                <dd className="mt-1 font-display text-3xl text-white">
                  {totalAssemblies}
                </dd>
              </div>
              <div className="min-w-28 rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <dt className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
                  Registrations
                </dt>
                <dd className="mt-1 font-display text-3xl text-white">
                  {totalRegistrations.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="page-shell relative z-10 -mt-8 pb-16">
        <GroupingsDirectory groups={groups} />

        <div className="mt-6 text-center">
          <Link
            href="/statistics"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition hover:text-primary-800"
          >
            View conference statistics <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}
