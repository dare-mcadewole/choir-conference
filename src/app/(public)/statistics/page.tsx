import Link from "next/link";
import { ArrowRight, BarChart3, Music2, Trophy, Users } from "lucide-react";
import * as dashboardService from "@/features/dashboard/service";

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

        <div className="mt-8 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <Users size={17} />
              </span>
              <div>
                <h2 className="font-display text-2xl text-slate-900">
                  By family
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Confirmed attendees across families
                </p>
              </div>
            </div>
            <div className="mt-7 space-y-6">
              {data.families.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>
                    <strong className="text-slate-800">{item.total}</strong>
                  </div>
                  <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-300 transition-[width]"
                      style={{
                        width: `${data.total ? Math.round((Number(item.total) / Number(data.total)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {!data.families.length && <Empty />}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-20 place-items-center rounded-xl bg-secondary-100/50 text-secondary-700">
                <Trophy size={64} strokeWidth={1} />
              </span>
              <div>
                <h2 className="font-display text-2xl text-slate-900 uppercase">
                  Leaderboard
                </h2>
                <p className="text-xs text-slate-500 uppercase">
                  Registrations by assembly
                </p>
              </div>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {data.leaderboard.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.family ?? "Family not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-slate-800">{item.total}</p>
                    <p className="text-xs text-slate-500">
                      {data.total
                        ? Math.round(
                            (Number(item.total) / Number(data.total)) * 100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              ))}
              {!data.leaderboard.length && <Empty />}
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <Users size={17} />
            </span>
            <div>
              <h2 className="font-display text-2xl text-slate-900">
                Registration categories
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Confirmed attendees by registration type
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.categories.map((item, index) => {
              const accents = [
                "border-slate-200",
                "border-slate-300",
                "border-slate-200",
                "border-slate-300",
              ];
              return (
                <div
                  key={item.name}
                  className={`rounded-xl border-l-4 bg-slate-50 p-4 ${accents[index % accents.length]}`}
                >
                  <p className="text-sm text-slate-500">{item.name}</p>
                  <p className="mt-2 font-display text-3xl text-slate-900">
                    {item.total}
                  </p>
                </div>
              );
            })}
            {!data.categories.length && <Empty />}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div
      className="
        relative overflow-hidden rounded-lg  bg-white p-5
        shadow-2xl shadow-primary/5 sm:p-6
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-8 size-24 rounded-full bg-slate-50"
      />
      <div
        className={`relative grid size-11 place-items-center rounded-2xl ${iconClassName}`}
      >
        {icon}
      </div>
      <h3 className="relative mt-6 font-display text-4xl text-slate-900">
        {value}
      </h3>
      <p className="relative uppercase text-sm text-slate-400 tracking-wider">
        {label}
      </p>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-8 text-center text-sm text-slate-500">
      Statistics will appear as registrations are confirmed.
    </p>
  );
}
