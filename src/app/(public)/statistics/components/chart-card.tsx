import type { ReactNode } from "react";
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
