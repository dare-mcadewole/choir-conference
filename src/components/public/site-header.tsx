import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="page-shell flex h-20 items-center justify-between text-white">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold"
        >
          <span className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10">
            <Logo className="size-7" />
          </span>{" "}
          ACC 2027
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link href="/#about">About</Link>
          <Link href="/#speakers">Speakers</Link>
          <Link href="/statistics">Statistics</Link>
          <Link
            className="rounded-full border border-white/25 px-4 py-2 hover:bg-white hover:text-ink"
            href="/register"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
