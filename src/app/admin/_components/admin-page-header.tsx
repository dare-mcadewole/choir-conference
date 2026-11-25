import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  id,
  className,
  children,
}: {
  title: string;
  description: string;
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header
      id={id}
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="font-display text-3xl text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </header>
  );
}
