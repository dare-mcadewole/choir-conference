import { CalendarDays, MapPin } from "lucide-react";

export function AnchorScripture({ scripture }: { scripture: string }) {
  return (
    <a
      href="https://www.bible.com/bible/111/2CO.3.6.NIV"
      target="_blank"
      className="
        mt-5 flex items-center justify-center gap-3 text-[10px] font-bold
        uppercase tracking-[.28em] text-secondary sm:text-xs
      "
    >
      <span aria-hidden="true" className="h-px w-8 bg-secondary/40" />
      {scripture}
      <span aria-hidden="true" className="h-px w-8 bg-secondary/40" />
    </a>
  );
}

export function ConferenceDetailsPill({
  dateLabel,
  venue,
}: {
  dateLabel: string;
  venue: string;
}) {
  return (
    <div className="mx-auto mt-6 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[11px] leading-5 text-white/75 sm:text-xs">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays size={14} className="text-secondary" />
        <span className="font-semibold text-white">{dateLabel}</span>
      </span>
      <span aria-hidden="true" className="hidden text-white/25 sm:inline">
        •
      </span>
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <MapPin size={14} className="shrink-0 text-secondary" />
        <span>{venue}</span>
      </span>
    </div>
  );
}
