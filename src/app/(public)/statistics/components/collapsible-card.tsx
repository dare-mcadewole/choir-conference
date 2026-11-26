"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  /** Whether the card starts expanded. */
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleCard({
  id,
  title,
  subtitle,
  icon: Icon,
  className,
  defaultOpen = false,
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      aria-labelledby={`${id}-title`}
      className={cn(
        "rounded-lg border-hairline border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200 sm:p-6",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-secondary-700">
            <Icon size={20} strokeWidth={1.8} />
            <h2
              id={`${id}-title`}
              className="text-lg font-medium text-slate-900"
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={cn(
            "mt-1 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </summary>

      {open && children}
    </details>
  );
}
