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
    <section className="rounded-lg border-hairline shadow-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center gap-2">
        <UserRoundGroup
          size={20}
          strokeWidth={1.95}
          className="text-secondary-700"
        />
        <h2 className="text-lg font-medium">By Music Game Family / Group</h2>
      </div>

      <div className="mt-5 space-y-3">
        {families.map((family) => {
          const familyTotal = Number(family.total);
          const percentage = confirmedTotal
            ? Math.min(100, Math.round((familyTotal / confirmedTotal) * 100))
            : 0;

          return (
            <div key={family.name}>
              <div className="flex items-end justify-between gap-3 text-sm">
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
    </section>
  );
}
