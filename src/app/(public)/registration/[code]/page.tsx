import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check, MessageCircle, Ticket } from "lucide-react";
import * as registrationService from "@/features/registration/service";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let registration: {
    fullName: string;
    status: string;
    registrationCode: string | null;
    ticketToken: string | null;
    ticketStatus: string | null;
    assembly: string | null;
    family: string | null;
    whatsappUrl: string | null;
  } | null = null;
  try {
    registration = await registrationService.findConfirmationByCode(code);
  } catch {
    /* configuration state below */
  }

  if (!registration) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-secondary/5 p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-24 size-64 rounded-full bg-primary-100/70 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-10 size-72 rounded-full bg-secondary-200/50 blur-3xl"
        />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-hairline border-primary-100 bg-white shadow-xl shadow-zinc-100">
          <div className="relative isolate overflow-hidden bg-primary px-8 py-10 text-center text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:28px_28px]" />
            <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[#fc63c1] opacity-30 blur-2xl" />
            <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/25">
              <Ticket className="text-secondary" size={26} strokeWidth={1.5} />
            </span>
            <h1 className="relative mt-5 font-display text-3xl uppercase">
              Confirmation unavailable
            </h1>
          </div>
          <div className="p-8 text-center">
            <p className="text-sm leading-6 text-slate-600">
              We could not find an active confirmed registration with this code.
            </p>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "mt-6 w-full",
              )}
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const firstName = registration.fullName.split(" ")[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-secondary/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-32 size-72 rounded-full bg-primary-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-12 size-80 rounded-full bg-secondary-200/40 blur-3xl"
      />

      <div className="page-shell relative py-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary">
              <Logo className="size-7" />
            </span>
            <span className="font-display text-xl sm:text-2xl">
              ACC <span className="text-primary">2027</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-primary"
          >
            <ArrowLeft size={16} /> Back to conference
          </Link>
        </header>

        <div className="mx-auto mt-10 max-w-2xl sm:mt-14">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">
            You&apos;re all set
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
            Your registration is confirmed and your conference family is
            assigned. Keep this code and your ticket handy for check-in.
          </p>

          <article className="mt-8 overflow-hidden rounded-2xl border-hairline border-primary-100 bg-white shadow-xl shadow-zinc-100">
            <div className="relative isolate overflow-hidden bg-primary px-6 py-8 text-center text-white sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]" />
              <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-[#fc63c1] opacity-30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-[#d095ff] opacity-25 blur-2xl" />

              <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary shadow-lg shadow-primary-950/25">
                <Check size={32} strokeWidth={2} />
              </span>
              <p className="relative mt-6 text-[10px] font-bold uppercase tracking-[.32em] text-secondary">
                Registration confirmed
              </p>
              <h2 className="relative mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">
                {registration.fullName}.
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/70 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary-600">
                    Registration code
                  </p>
                  <p className="mt-1 break-all font-extrabold text-2xl tracking-wider text-primary-950">
                    {registration.registrationCode ?? "—"}
                  </p>
                </div>
                <Ticket
                  className="shrink-0 text-primary-300"
                  size={30}
                  strokeWidth={1.25}
                />
              </div>

              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                <Row label="Assembly" value={registration.assembly} />
                <Row label="Music Games family" value={registration.family} />
                <Row
                  label="WhatsApp Group"
                  value={
                    registration.whatsappUrl ? (
                      <a
                        href={registration.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "mt-3 w-full border-primary-100 text-primary-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800",
                        )}
                      >
                        <MessageCircle size={17} />
                        Join group
                      </a>
                    ) : (
                      <span className="mt-5 text-right text-sm text-slate-400">
                        Not available yet
                      </span>
                    )
                  }
                />

                <Row
                  label="Status"
                  value={
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-secondary-900">
                      <span className="size-1.5 rounded-full bg-secondary-600" />
                      Confirmed
                    </span>
                  }
                />
              </dl>

              {registration.ticketToken &&
                registration.ticketStatus === "VALID" && (
                  <div className="text-right">
                    <Link
                      href={`/ticket/${registration.ticketToken}`}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "lg" }),
                        "mt-7",
                      )}
                    >
                      <Ticket size={17} /> Open full ticket page
                    </Link>
                  </div>
                )}
            </div>
          </article>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Need to make a change? Contact the conference team and quote your
            registration code.
          </p>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
        {label}
      </dt>
      <dd className="text-right font-semibold text-ink">{value ?? "—"}</dd>
    </div>
  );
}
