"use client";

import { CollapsibleCard } from "@/app/(public)/statistics/components/collapsible-card";
import { Badge } from "@/components/ui/badge";
import type { StatisticalBreakdown } from "@/features/dashboard/service";
import { UserRoundGroup } from "lucide-react";

export function FamilyBreakdown({
  families,
  total,
}: {
  families: StatisticalBreakdown["families"];
  total: number | string;
}) {
  return (
    <CollapsibleCard
      id="music-game"
      title="By Music Game Family / Group"
      subtitle="Registration breakdown by music game groupings"
      icon={UserRoundGroup}
    >
      <div className="mt-4 mb-2 space-y-4">
        {families.map((family) => {
          const familyTotal = Number(family.total);
          const percentage = +total
            ? Math.min(100, Math.round((familyTotal / +total) * 100))
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

                <h2 className="font-semibold text-slate-800 text-2xl">
                  {family.total}
                </h2>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
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
    </CollapsibleCard>
  );
}
