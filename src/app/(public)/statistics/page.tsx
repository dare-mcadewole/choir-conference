import Link from "next/link";
import { ArrowRight, BarChart3, Music2, Users } from "lucide-react";
import * as dashboardService from "@/features/dashboard/service";
import Metric from "@/app/(public)/statistics/components/Metric";
import { AssemblyLeaderboard } from "./components/assembly-leaderboard";
import { FamilyBreakdown } from "./components/family-breakdown";
import { RegistrationCategoryBreakdown } from "./components/registration-category-breakdown";

async function stats() {
  try {
    return await dashboardService.findStatistics();
  } catch {
    return { total: 0, families: [], leaderboard: [], categories: [] };
  }
}

export default async function StatisticsPage() {
  const data = await stats();

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <section className="relative isolate overflow-hidden bg-primary text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-[55%] size-40 rounded-full bg-[#fc63c1] opacity-80 blur-sm sm:size-56"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[#d095ff]/25 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] top-[67%] h-4 w-44 -rotate-[14deg] rounded-full bg-secondary/40 sm:h-6 sm:w-64"
        />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
              <Music2 size={20} />
            </span>
            <span className="font-display text-xl sm:text-2xl">
              ACC <span className="text-secondary">2027</span>
            </span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-secondary-300"
          >
            Register <ArrowRight size={16} />
          </Link>
        </header>

        <div className="page-shell relative py-14 sm:py-20">
          <p className="inline-flex rounded-full border border-secondary/40 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-secondary sm:text-xs">
            Public registration view
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[.95] sm:text-6xl md:text-7xl">
            Conference <span className="text-secondary">Statistics</span>
          </h1>
        </div>
      </section>

      <div className="page-shell relative z-10 -mt-10 pb-16 sm:-mt-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            icon={<Users size={20} />}
            label="Confirmed registrations"
            value={String(data.total)}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <Metric
            icon={<BarChart3 size={20} />}
            label="Assemblies represented"
            value={String(
              data.leaderboard.filter((item) => Number(item.total) > 0).length,
            )}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <Metric
            icon={<Users size={20} />}
            label="Conference families"
            value={String(data.families.length)}
            iconClassName="bg-slate-100 text-slate-600"
          />
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-5">
          <FamilyBreakdown families={data.families} total={data.total} />
          <RegistrationCategoryBreakdown categories={data.categories} />
        </div>

        <div className="mt-8">
          <AssemblyLeaderboard
            leaderboard={data.leaderboard}
            total={data.total}
          />
        </div>
      </div>
    </main>
  );
}
