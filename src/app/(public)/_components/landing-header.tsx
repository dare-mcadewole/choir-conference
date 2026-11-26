import { ArrowDown } from "lucide-react";
import { Logo } from "@/components/logo";

export function LandingHeader({
  title,
  registrationOpen,
  registrationLabel,
}: {
  title: string;
  registrationOpen: boolean;
  registrationLabel: string;
}) {
  return (
    <header className="relative page-shell flex items-center justify-between">
      <div className="flex items-center gap-3 text-base font-semibold tracking-tight sm:text-xl">
        <span className="grid size-9 place-items-center rounded-full bg-primary">
          <Logo className="size-7" />
        </span>
        {title}
      </div>

      {registrationOpen ? (
        <a
          href="#register"
          className="hidden items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-medium sm:inline-flex"
        >
          Register now <ArrowDown size={16} />
        </a>
      ) : (
        <span className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/60 sm:inline-flex">
          {registrationLabel}
        </span>
      )}
    </header>
  );
}
