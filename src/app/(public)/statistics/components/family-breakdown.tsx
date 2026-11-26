import { ChartCard } from "@/app/(public)/statistics/components/chart-card";
import { Badge } from "@/components/ui/badge";
import { StatisticalBreakdown } from "@/features/dashboard/service";
import { UserRoundGroup, Users, UsersRound } from "lucide-react";

export function FamilyBreakdown({
  families,
  total,
}: {
  families: StatisticalBreakdown["families"];
  total: number | string;
}) {
  const confirmedTotal = Number(total);

  return (
    <ChartCard
      id="music-game"
      title="By Music Game Family / Group"
      subtitle="Registration breakdown by music game groupings"
      icon={UserRoundGroup}
    >
      <div className="mt-4 space-y-4">
        {families.map((family) => {
          const familyTotal = Number(family.total);
          const percentage = confirmedTotal
            ? Math.min(100, Math.round((familyTotal / confirmedTotal) * 100))
            : 0;

          return (
            <div key={family.name}>
              <div className="flex items-end justify-between gap-3.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-slate-700 text-base">
                    {family.name}
                  </h4>
                  {family.alias && (
                    <Badge variant="outline" className="rounded-full">
                      {family.alias}
                    </Badge>
                  )}
                </div>

                <h2 className="font-display text-slate-800 text-2xl">
                  {family.total}
                </h2>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-300 transition-[width]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {!families.length && (
          <p className="py-8 text-center text-sm text-slate-500">
            Statistics will appear as registrations are confirmed.
          </p>
        )}
      </div>
    </ChartCard>
  );
}
