import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  UserRoundGroup,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/logo";
import * as dashboardService from "@/features/dashboard/service";
import Metric from "@/app/(public)/statistics/components/Metric";
import { AgeDistributionChart } from "./components/age-distribution-chart";
import { AssemblyLeaderboard } from "./components/assembly-leaderboard";
import { FamilyBreakdown } from "./components/family-breakdown";
import { GenderRatioChart } from "./components/gender-ratio-chart";
import { RegistrationCategoryChart } from "./components/registration-category-chart";
import { RegistrationTrendChart } from "./components/registration-trend-chart";

async function stats() {
  try {
    return await dashboardService.findStatistics();
  } catch {
    return {
      total: 0,
      totalRegistrations: 0,
      registrationTrend: [],
      ageDistribution: [],
      genderRatio: [],
      families: [],
      leaderboard: [],
      categories: [],
    };
  }
}

export default async function StatisticsPage() {
  const data = await stats();

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-50">
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
            <span className="grid size-10 place-items-center rounded-full bg-primary">
              <Logo className="size-8" />
            </span>
            <span className="text-base font-semibold tracking-tight sm:text-xl">
              All Choirs' Conference 2027
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={ClipboardList}
            label="Total registrations"
            value={String(data.totalRegistrations)}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <Metric
            icon={UsersRound}
            label="Confirmed registrations"
            value={String(data.total)}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <Metric
            icon={Building2}
            label="Assemblies represented"
            value={String(
              data.leaderboard.filter((item) => Number(item.total) > 0).length,
            )}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <Metric
            icon={UserRoundGroup}
            label="Music Game families"
            value={String(data.families.length)}
            iconClassName="bg-slate-100 text-slate-600"
          />
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <RegistrationTrendChart data={data.registrationTrend} />
          </div>
          <FamilyBreakdown families={data.families} total={data.total} />
          <GenderRatioChart data={data.genderRatio} />
          <AgeDistributionChart data={data.ageDistribution} />
          <RegistrationCategoryChart data={data.categories} />
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
