import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as conferenceService from "@/features/conference/service";
import { CountdownTimer } from "@/features/conference/components/countdown-timer";
import { RegistrationForm } from "@/features/registration/components/form";
import * as registrationService from "@/features/registration/service";
import { HistoricalJsonData } from "@/features/ticket/types";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Register",
  description: "Secure your place at the All Choirs' Conference 2027.",
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ lookup?: string }>;
}) {
  const params = await searchParams;
  const settings = await conferenceService.findOne().catch(() => null);
  const registrationOpen = settings?.registrationOpen === true;

  if (!registrationOpen) {
    const unavailable = !settings;

    return (
      <main className="min-h-screen">
        <div className="page-shell py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft size={16} /> Back to conference
          </Link>

          <div className="mx-auto mt-16 max-w-xl rounded-2xl border-hairline border-primary-100 bg-white p-8 text-center shadow-xl shadow-zinc-100 sm:p-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
              <LockKeyhole size={26} strokeWidth={1.8} />
            </span>
            <p className="eyebrow mt-6">All Choirs&apos; Conference 2027</p>
            <h1 className="mt-3 font-display text-2xl uppercase leading-none sm:text-3xl">
              {unavailable
                ? "Registration is unavailable"
                : "Registration is closed"}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600">
              {unavailable
                ? "We could not load registration right now. Please try again shortly."
                : "Registration is not open right now. Please check back later or reach out to the conference team."}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-primary-100 text-primary-700 hover:bg-primary-50 sm:w-auto",
                )}
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  let data;
  let initial:
    | {
        fullName?: string;
        email?: string;
        phone?: string;
        data?: HistoricalJsonData;
      }
    | undefined;

  try {
    data = await registrationService.publicRegistrationOptions();
    const lookup = params.lookup?.trim();
    if (lookup) {
      const result = await registrationService.lookupRegistrant(lookup);
      if (result.state === "historical") {
        initial = result.data;
      } else if (result.state === "new") {
        initial = lookup.includes("@") ? { email: lookup } : { phone: lookup };
      }
    }
  } catch {
    data = {
      assemblies: [],
      categories: [],
      positions: [],
      institutions: [],
      levels: [],
    };
  }

  return (
    <main className="min-h-screen">
      <CountdownTimer
        targetDate={settings?.closesAt?.toISOString() ?? null}
        enabled={settings?.showCountdownTimer ?? true}
      />
      <div className="page-shell py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} /> Back to conference
        </Link>
        <div className="mx-auto mt-12 max-w-3xl">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl uppercase">
            Secure your spot
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Complete the form below. Your conference family will be assigned
            automatically from your assembly.
          </p>

          <div
            className="
            mt-10 rounded-xl bg-white border-hairline border-primary-100
            shadow-xl shadow-zinc-100 p-6 md:p-9
          "
          >
            <RegistrationForm {...data} initial={initial} />
          </div>

          <p
            className="
              mt-6 flex justify-center items-center gap-2
              text-center text-xs text-slate-500
            "
          >
            <ShieldCheck size={16} strokeWidth={1.25} />
            Your information is handled securely and is never included in a
            public attendee directory.
          </p>
        </div>
      </div>
    </main>
  );
}
