"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UserRound } from "lucide-react";
import type { StatisticalBreakdown } from "@/features/dashboard/service";
import { ChartEmpty } from "./chart-card";
import { CollapsibleCard } from "./collapsible-card";
import { ChartDataTable } from "./chart-data-table";
import {
  axisTick,
  chartColors,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

const AGE_LABELS: Record<string, string> = {
  "15 - 20": "15–20",
  "21 - 29": "21–29",
  "30 - 39": "30–39",
  "40 - 49": "40–49",
  "50 and above": "50+",
};

function ageLabel(range: string) {
  return AGE_LABELS[range] ?? range;
}

export function AgeDistributionChart({
  data,
}: {
  data: StatisticalBreakdown["ageDistribution"];
}) {
  const total = data.reduce((sum, entry) => sum + Number(entry.total), 0);

  return (
    <CollapsibleCard
      id="age-distribution"
      title="Age distribution"
      subtitle="Registrants grouped by age band."
      icon={UserRound}
    >
      {total === 0 ? (
        <ChartEmpty message="Age data will appear with the first registrations." />
      ) : (
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              accessibilityLayer
              barCategoryGap="26%"
              margin={{ top: 20, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="range"
                tickFormatter={ageLabel}
                tick={axisTick}
                tickLine={false}
                axisLine={{ stroke: chartColors.axisLine }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ fill: "rgba(8, 57, 216, 0.04)" }}
                formatter={(value) => [String(value), "Registrants"]}
              />
              <Bar
                dataKey="total"
                name="Registrants"
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.range}
                    fill={
                      chartColors.ageRamp[index] ?? chartColors.neutral
                    }
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  fill={chartColors.label}
                  fontSize={11}
                  fontWeight={600}
                  formatter={(value: unknown) =>
                    Number(value) > 0 ? String(value) : ""
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {total > 0 && (
        <ChartDataTable
          label="Age distribution"
          rowLabel="Age band"
          rows={data.map((entry) => ({
            label: ageLabel(entry.range),
            value: entry.total,
          }))}
        />
      )}
    </CollapsibleCard>
  );
}
