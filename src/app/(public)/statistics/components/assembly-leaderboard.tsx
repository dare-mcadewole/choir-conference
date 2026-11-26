import { StatisticalBreakdown } from "@/features/dashboard/service";
import { Trophy } from "lucide-react";

export function AssemblyLeaderboard({
  leaderboard,
  totalRegistrations,
}: {
  leaderboard: StatisticalBreakdown["leaderboard"];
  totalRegistrations: number | string;
}) {
  return (
    <section className="rounded-lg border-hairline shadow-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-20 place-items-center rounded-xl bg-secondary-100/50 text-secondary-700">
          <Trophy size={64} strokeWidth={1} />
        </span>
        <div>
          <h2 className="font-display text-2xl uppercase text-slate-900">
            Leaderboard
          </h2>
          <p className="text-xs uppercase text-slate-500">
            Registrations by assembly
          </p>
        </div>
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {leaderboard.map((assembly, index) => (
          <div
            key={assembly.id}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {assembly.name}
                </p>
                <p className="text-xs text-slate-500">
                  {assembly.family ?? "Not assigned to a music game family yet"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-slate-800">{assembly.total}</p>
              <p className="text-xs text-slate-500">
                {totalRegistrations
                  ? Math.round((+assembly.total / +totalRegistrations) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        ))}
        {!leaderboard.length && (
          <p className="py-8 text-center text-sm text-slate-500">
            Statistics will appear as registrations are confirmed.
          </p>
        )}
      </div>
    </section>
  );
}
