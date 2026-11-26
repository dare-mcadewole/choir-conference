"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { StatisticalBreakdown } from "@/features/dashboard/service";
import { ChartCard, ChartDataTable, ChartEmpty } from "./chart-card";
import {
  axisTick,
  chartColors,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chart-theme";

export function RegistrationTrendChart({
  data,
}: {
  data: StatisticalBreakdown["registrationTrend"];
}) {
  const total = data.reduce((sum, point) => sum + Number(point.total), 0);

  return (
    <ChartCard
      id="registration-trend"
      title="Registration trend"
      subtitle="Daily registrations across the registration window."
      icon={TrendingUp}
    >
      {total === 0 ? (
        <ChartEmpty message="Registration activity will appear here as attendees sign up." />
      ) : (
        <div className="mt-5 h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              accessibilityLayer
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="registration-trend-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColors.primary}
                    stopOpacity={0.14}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors.primary}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={axisTick}
                tickLine={false}
                axisLine={{ stroke: chartColors.axisLine }}
                interval="preserveStartEnd"
                minTickGap={28}
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
                cursor={{
                  stroke: chartColors.primary,
                  strokeOpacity: 0.2,
                  strokeWidth: 1,
                }}
                formatter={(value) => [String(value), "Registrations"]}
              />
              <Area
                type="linear"
                dataKey="total"
                name="Registrations"
                stroke={chartColors.primary}
                strokeWidth={2}
                fill="url(#registration-trend-fill)"
                isAnimationActive={false}
                dot={{
                  r: 4,
                  fill: chartColors.primary,
                  stroke: chartColors.surface,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: chartColors.primary,
                  stroke: chartColors.surface,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {total > 0 && (
        <ChartDataTable
          label="Registration trend"
          rowLabel="Date"
          rows={data.map((point) => ({
            label: point.label,
            value: point.total,
          }))}
        />
      )}
    </ChartCard>
  );
}
