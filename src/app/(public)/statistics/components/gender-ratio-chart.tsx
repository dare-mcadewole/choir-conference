"use client";

import { UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatisticalBreakdown } from "@/features/dashboard/service";
import { ChartCard, ChartEmpty } from "./chart-card";
import { ChartDataTable } from "./chart-data-table";
import { chartColors } from "./chart-theme";

export function GenderRatioChart({
  data,
}: {
  data: StatisticalBreakdown["genderRatio"];
}) {
  const male = Number(data.find((entry) => entry.key === "MALE")?.total ?? 0);
  const female = Number(
    data.find((entry) => entry.key === "FEMALE")?.total ?? 0,
  );
  const total = male + female;
  const malePercentage = total ? Math.round((male / total) * 100) : 0;
  const femalePercentage = total ? 100 - malePercentage : 0;

  return (
    <ChartCard
      id="gender-ratio"
      title="Gender ratio"
      subtitle="Male and female share of total registrations."
      icon={UsersRound}
    >
      {total === 0 ? (
        <ChartEmpty message="Gender data will appear with the first registrations." />
      ) : (
        <>
          <div
            role="group"
            aria-label={`Gender ratio for ${total} registrants`}
            className="mt-8 flex h-6 w-full"
          >
            {male > 0 && (
              <div
                tabIndex={0}
                role="img"
                aria-label={`Male: ${male.toLocaleString()} registrants, ${malePercentage}%`}
                style={{
                  width: `${malePercentage}%`,
                  backgroundColor: chartColors.primary,
                }}
                className={cn(
                  "group relative flex h-full items-center justify-center transition-[filter] hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  female > 0
                    ? "rounded-l-full border-r-2 border-white"
                    : "rounded-full",
                )}
              >
                {malePercentage >= 14 && (
                  <span
                    aria-hidden="true"
                    className="text-[10px] font-bold text-white"
                  >
                    {malePercentage}%
                  </span>
                )}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
                  Male · {male.toLocaleString()} ({malePercentage}%)
                </span>
              </div>
            )}

            {female > 0 && (
              <div
                tabIndex={0}
                role="img"
                aria-label={`Female: ${female.toLocaleString()} registrants, ${femalePercentage}%`}
                style={{
                  width: `${femalePercentage}%`,
                  backgroundColor: chartColors.female,
                }}
                className={cn(
                  "group relative flex h-full items-center justify-center transition-[filter] hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  male > 0 ? "rounded-r-full" : "rounded-full",
                )}
              >
                {femalePercentage >= 14 && (
                  <span
                    aria-hidden="true"
                    className="text-[10px] font-bold text-ink"
                  >
                    {femalePercentage}%
                  </span>
                )}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
                  Female · {female.toLocaleString()} ({femalePercentage}%)
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <GenderLegend
              color={chartColors.primary}
              label="Male"
              count={male}
              percentage={malePercentage}
            />
            <GenderLegend
              color={chartColors.female}
              label="Female"
              count={female}
              percentage={femalePercentage}
            />
          </div>

          <ChartDataTable
            label="Gender ratio"
            rowLabel="Gender"
            valueLabel="Registrants"
            rows={[
              {
                label: "Male",
                value: `${male.toLocaleString()} (${malePercentage}%)`,
              },
              {
                label: "Female",
                value: `${female.toLocaleString()} (${femalePercentage}%)`,
              },
            ]}
            defaultOpen
          />
        </>
      )}
    </ChartCard>
  );
}

function GenderLegend({
  color,
  label,
  count,
  percentage,
}: {
  color: string;
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-xs">
      <span className="flex items-center gap-2 text-slate-600">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className="text-slate-800">
        <strong className="font-semibold">{count.toLocaleString()}</strong>
        <span className="ml-1.5 text-slate-400">({percentage}%)</span>
      </span>
    </div>
  );
}
