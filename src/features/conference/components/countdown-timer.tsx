"use client";

import { Fragment, useEffect, useState } from "react";

type CountdownTimerProps = {
  targetDate: string | null;
  enabled?: boolean;
};

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const units = [
  { key: "days", label: "days", short: "d" },
  { key: "hours", label: "hrs", short: "h" },
  { key: "minutes", label: "min", short: "m" },
  { key: "seconds", label: "sec", short: "s" },
] as const;

function getTimeLeft(targetTime: number): TimeLeft {
  const total = Math.max(0, targetTime - Date.now());

  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function CountdownTimer({
  targetDate,
  enabled = true,
}: CountdownTimerProps) {
  const targetTime = targetDate ? new Date(targetDate).getTime() : Number.NaN;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!enabled || !Number.isFinite(targetTime)) return;

    const update = () => setTimeLeft(getTimeLeft(targetTime));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [enabled, targetTime]);

  if (!enabled || !Number.isFinite(targetTime) || targetTime <= Date.now()) {
    return null;
  }
  if (timeLeft && timeLeft.total <= 0) return null;

  const accessibleLabel = timeLeft
    ? `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds until the conference begins`
    : "Countdown to the conference";

  return (
    <>
      <div aria-hidden="true" className="h-9" />
      <div className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-primary/0 bg-secondary text-secondary-foreground shadow-lg shadow-primary/0">
        <div className="page-shell flex h-9 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[.2em] sm:text-[10px]">
            <span className="hidden sm:inline">Registration closes in</span>
            <span className="sm:hidden">Closes in</span>
          </p>

          <div
            role="timer"
            aria-live="off"
            aria-label={accessibleLabel}
            className="flex shrink-0 items-center gap-1.5 sm:gap-2.5"
          >
            {units.map((unit, index) => (
              <Fragment key={unit.key}>
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="font-display text-sm leading-none opacity-30"
                  >
                    :
                  </span>
                )}
                <span className="flex items-baseline gap-0.5 md:gap-1">
                  <span className="text-base font-semibold leading-none tabular-nums sm:text-lg">
                    {timeLeft ? pad(timeLeft[unit.key]) : "--"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[.12em] opacity-60">
                    <span className="">{unit.label}</span>
                  </span>
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
