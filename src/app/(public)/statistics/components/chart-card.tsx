"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
};

export function ChartCard({
  id,
  title,
  subtitle,
  icon: Icon,
  className,
  children,
}: ChartCardProps) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        "rounded-lg border-hairline border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-secondary-700">
        <Icon size={20} strokeWidth={1.8} />
        <h2 id={`${id}-title`} className="text-lg font-medium text-slate-900">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      )}
      {children}
    </section>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="mt-5 flex h-56 items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}

export function ChartDataTable({
  label,
  rowLabel,
  valueLabel = "Registrations",
  rows,
  defaultOpen = false,
}: {
  label: string;
  rowLabel: string;
  valueLabel?: string;
  rows: Array<{ label: string; value: string | number }>;
  /** Whether the data table starts expanded. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!rows.length) return null;

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="mt-4 border-t border-slate-100 pt-3 text-xs"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-slate-500 transition hover:text-primary [&::-webkit-details-marker]:hidden">
        View data
        <span aria-hidden="true" className="text-[9px]">
          ▾
        </span>
      </summary>
      <table className="mt-3 w-full border-collapse text-left">
        <caption className="sr-only">{label} data</caption>
        <thead>
          <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
            <th scope="col" className="py-2 pr-3 font-semibold">
              {rowLabel}
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              {valueLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.label}-${index}`}
              className="border-b border-slate-50 last:border-0"
            >
              <th
                scope="row"
                className="py-2 pr-3 font-medium text-slate-600"
              >
                {row.label}
              </th>
              <td className="py-2 text-right font-semibold tabular-nums text-slate-800">
                {typeof row.value === "number"
                  ? row.value.toLocaleString()
                  : row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
