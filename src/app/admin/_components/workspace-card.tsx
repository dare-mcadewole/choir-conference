import type { LucideIcon } from "lucide-react";

export function WorkspaceCard({
  icon: Icon,
  title,
  detail,
  color,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  color: string;
}) {
  return (
    <article className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${color}`}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-xs font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-1 truncate text-[10px] text-slate-500">{detail}</p>
      </div>
    </article>
  );
}
