import Link from "next/link";
import { CheckCircle2, Download, MessageCircle, Ticket } from "lucide-react";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { assemblies, conferenceFamilies, registrations } from "@/db/schema";

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
    assembly: string | null;
    family: string | null;
    whatsappUrl: string | null;
  } | null = null;
  try {
    const db = getDb();
    const row = await db
      .select({
        fullName: registrations.fullName,
        status: registrations.status,
        registrationCode: registrations.registrationCode,
        ticketToken: registrations.ticketToken,
        assembly: assemblies.name,
        family: conferenceFamilies.name,
        whatsappUrl: conferenceFamilies.whatsappUrl,
      })
      .from(registrations)
      .leftJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
      .leftJoin(
        conferenceFamilies,
        eq(registrations.familyId, conferenceFamilies.id),
      )
      .where(
        and(
          eq(registrations.registrationCode, code),
          eq(registrations.status, "CONFIRMED"),
        ),
      )
      .limit(1);
    registration = row[0] ?? null;
  } catch {
    /* configuration state below */
  }
  if (!registration)
    return (
      <main className="grid min-h-screen place-items-center bg-mist p-6">
        <div className="card max-w-md p-8 text-center">
          <Ticket className="mx-auto text-wine" size={36} />
          <h1 className="mt-4 font-display text-3xl">
            Confirmation unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We could not find an active confirmed registration with this code.
          </p>
          <Link className="button-primary mt-6" href="/">
            Return home
          </Link>
        </div>
      </main>
    );
  return (
    <main className="min-h-screen bg-mist py-16">
      <div className="mx-auto max-w-xl px-5">
        <div className="card overflow-hidden">
          <div className="bg-ink px-8 py-9 text-center text-white">
            <CheckCircle2 className="mx-auto text-gold" size={42} />
            <p className="mt-5 text-sm text-gold">REGISTRATION CONFIRMED</p>
            <h1 className="mt-2 font-display text-4xl">
              Welcome, {registration.fullName.split(" ")[0]}.
            </h1>
          </div>
          <div className="p-8">
            <dl className="divide-y text-sm">
              <Row
                label="Registration code"
                value={registration.registrationCode}
              />
              <Row label="Assembly" value={registration.assembly} />
              <Row label="Conference family" value={registration.family} />
              <Row label="Status" value="Confirmed" />
            </dl>
            {registration.ticketToken && (
              <Link
                className="button-primary mt-7 w-full"
                href={`/ticket/${registration.ticketToken}`}
              >
                <Download size={17} className="mr-2" />
                View digital ticket
              </Link>
            )}
            {registration.whatsappUrl ? (
              <a
                className="button-secondary mt-3 w-full"
                href={registration.whatsappUrl}
                target="_blank"
              >
                <MessageCircle size={17} className="mr-2" />
                Join {registration.family} WhatsApp group
              </a>
            ) : (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-600">
                Your family WhatsApp link will be shared shortly.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-right text-ink">{value ?? "—"}</dd>
    </div>
  );
}
