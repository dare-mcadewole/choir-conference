import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-ink py-12 text-slate-300">
      <div className="page-shell flex flex-col justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
            <Logo className="size-8" />
          </span>
          <div>
            <p className="font-display text-xl text-white">
              ALL CHOIRS&apos; CONFERENCE 2027
            </p>
            <p className="mt-2 text-sm text-gold">THE ABLE MINISTER</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/register">Registration</Link>
          <Link href="/statistics">Conference statistics</Link>
          <Link href="/admin">Administration</Link>
        </div>
        <p className="text-sm">© 2027 All Choirs&apos; Conference.</p>
      </div>
    </footer>
  );
}
