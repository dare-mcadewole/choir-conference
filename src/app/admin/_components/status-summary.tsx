export function StatusSummary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs text-slate-600">
        <span className={`size-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="text-xs font-semibold text-slate-800">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
