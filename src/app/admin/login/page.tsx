import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "./components/login-form";
import { Logo } from "@/components/logo";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin sign in",
  description: "Sign in to the conference administration area.",
});

const authErrors: Record<string, string> = {
  admin_allowlist_not_configured:
    "Admin access is not configured. Add trusted addresses to ADMIN_EMAILS.",
  not_authorized:
    "This account does not have administrator access. Use an approved admin email.",
  sign_in_required:
    "Sign in with an approved administrator account to continue.",
  supabase_not_configured:
    "Supabase Auth is not configured. Set its URL and anon key in the server environment.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY,
  );
  const adminAllowlistConfigured = Boolean(
    process.env.ADMIN_EMAILS?.split(",").some((email) => email.trim()),
  );
  const initialMessage =
    authErrors[error ?? ""] ??
    (!supabaseConfigured
      ? authErrors.supabase_not_configured
      : !adminAllowlistConfigured
        ? authErrors.admin_allowlist_not_configured
        : null);
  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-indigo-950/15 lg:min-h-[620px] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-primary-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-20 top-16 size-72 rounded-full bg-[#7778e8]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full bg-[#d4ff00]/5 blur-3xl" />
          <Link href="/" className="relative flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Logo className="size-8" />
            </span>
            <span className="text-sm font-bold tracking-wide">
              ALL CHOIRS&apos; CONFERENCE
            </span>
          </Link>
          <div className="relative max-w-sm">
            <h1 className="mt-5 text-5xl font-bold text-secondary-200">
              Sign In
            </h1>
            <p className="mt-3 text-sm leading-6 text-secondary-100/50">
              Manage registrations, conference information, speakers, tickets,
              and payments from one place.
            </p>
          </div>
          <p className="relative text-xs text-white/35">
            All Choirs&apos; Conference · January 8–9, 2027
          </p>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <Link
            href="/admin"
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#5556c8]"
          >
            <ArrowLeft size={15} /> Back to dashboard
          </Link>

          <div className="mt-12 max-w-md">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#171923] lg:hidden">
              <Logo className="size-8" />
            </span>

            <h2 className="mt-1 font-display text-3xl uppercase text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Sign in to continue to the conference dashboard.
            </p>

            <AdminLoginForm
              authConfigured={supabaseConfigured && adminAllowlistConfigured}
              initialMessage={initialMessage}
            />

            <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
              Need administrator access? Contact the conference team.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
