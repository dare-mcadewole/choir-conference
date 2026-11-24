import type { LucideIcon } from "lucide-react";

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={`grid size-8 place-items-center rounded-xl ${color}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 truncate text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 truncate text-[11px] text-slate-400">{detail}</p>
    </article>
  );
}
