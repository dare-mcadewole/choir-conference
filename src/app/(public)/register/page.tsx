import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { RegistrationForm } from "@/features/registration/components/form";
import {
  publicRegistrationOptions,
  lookupRegistrant,
} from "@/features/registration/service";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ lookup?: string }>;
}) {
  const params = await searchParams;
  let data;
  let initial:
    { fullName?: string; email?: string; phone?: string } | undefined;
  try {
    data = await publicRegistrationOptions();
    const lookup = params.lookup?.trim();
    if (lookup) {
      const result = await lookupRegistrant(lookup);
      if (result.state === "historical") initial = result.data;
      else if (result.state === "new")
        initial = lookup.includes("@") ? { email: lookup } : { phone: lookup };
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
