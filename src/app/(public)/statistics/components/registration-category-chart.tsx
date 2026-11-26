"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LayoutGrid } from "lucide-react";
import type { StatisticalBreakdown } from "@/features/dashboard/service";
import { ChartCard, ChartEmpty } from "./chart-card";
import { ChartDataTable } from "./chart-data-table";
import {
  chartColors,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

export function RegistrationCategoryChart({
  data,
}: {
  data: StatisticalBreakdown["categories"];
}) {
  const chartData = data
    .map((category) => ({
      name: category.name,
      total: Number(category.total),
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const total = chartData.reduce((sum, category) => sum + category.total, 0);

  return (
    <ChartCard
      id="registration-category"
      title="By Category"
      subtitle="Registrants across registration categories."
      icon={LayoutGrid}
    >
      {total === 0 ? (
        <ChartEmpty message="Category data will appear with the first registrations." />
      ) : (
        <div
          className="mt-3.5"
          style={{ height: Math.max(240, chartData.length * 44) }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              accessibilityLayer
              margin={{ top: 4, right: 36, bottom: 4, left: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={112}
                tick={{ fill: chartColors.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
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
                fill={chartColors.primary}
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="total"
                  position="right"
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
          label="Registrants by category"
          rowLabel="Category"
          rows={chartData.map((category) => ({
            label: category.name,
            value: category.total,
          }))}
        />
      )}
    </ChartCard>
  );
}
