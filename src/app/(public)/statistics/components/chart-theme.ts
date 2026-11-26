import type { CSSProperties } from "react";

export const chartColors = {
  primary: "#0839D8",
  female: "#FC63C1",
  ageRamp: ["#90A7FF", "#5D7BFF", "#3157F0", "#0839D8", "#062CA8"],
  neutral: "#94A3B8",
  grid: "#EDF0F7",
  axisLine: "#E2E8F0",
  tick: "#64748B",
  label: "#475569",
  ink: "#121B2E",
  surface: "#FFFFFF",
} as const;

export const axisTick = {
  fill: chartColors.tick,
  fontSize: 11,
};

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: chartColors.surface,
  border: `1px solid ${chartColors.axisLine}`,
  borderRadius: "12px",
  boxShadow: "0 12px 30px rgba(18, 27, 46, 0.12)",
  padding: "10px 12px",
  fontSize: "12px",
};

export const tooltipLabelStyle: CSSProperties = {
  color: chartColors.tick,
  fontSize: "11px",
  marginBottom: "2px",
};

export const tooltipItemStyle: CSSProperties = {
  color: chartColors.ink,
  fontSize: "12px",
  fontWeight: 600,
};
