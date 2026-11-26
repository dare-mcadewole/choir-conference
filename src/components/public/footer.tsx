import Link from "next/link";
import { Logo } from "@/components/logo";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  // { href: "/statistics", label: "Statistics" },
  { href: "/bulk-payment", label: "Bulk payment" },
  { href: "/admin/login", label: "Login" },
] as const;

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-white/10 bg-primary-950 text-white"
    >
      <div className="page-shell py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10">
              <Logo className="size-7" />
            </span>
            <span>
              <span className="block font-medium text-xs uppercase sm:text-sm">
                All Choirs&apos; Conference
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[.24em] text-secondary">
                The Able Minister
              </span>
            </span>
          </Link>

          <nav aria-label="Footer" className="md:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
              Quick links
            </p>
            <ul className="mt-2 flex flex-wrap gap-3 text-xs md:justify-end">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 transition hover:text-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 text-[11px] leading-5 text-white/60 sm:flex-row sm:items-center sm:justify-center">
          <p>&copy; {year} All Choirs&apos; Conference. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
