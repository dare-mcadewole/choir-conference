import { LucideIcon } from "lucide-react";

export default function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div
      className="
        relative overflow-hidden rounded-lg  bg-white p-5
        shadow-2xl shadow-primary/5 sm:p-6
      "
    >
      <div className="flex justify-end text-slate-300">
        <Icon size={36} strokeWidth={1} />
      </div>
      <h3 className="relative mt-6 font-display text-4xl text-slate-900">
        {value}
      </h3>
      <p className="relative uppercase text-sm text-slate-400 font-medium tracking-wider">
        {label}
      </p>
    </div>
  );
}
