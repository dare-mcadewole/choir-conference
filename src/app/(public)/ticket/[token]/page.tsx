import Link from "next/link";
import { notFound } from "next/navigation";
import * as conferenceService from "@/features/conference/service";
import * as ticketService from "@/features/ticket/service";
import { TicketCard } from "@/features/ticket/components/ticket-card";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let ticket;
  let theme: string | null = null;
  let anchorScripture: string | null = null;

  try {
    const [foundTicket, settings] = await Promise.all([
      ticketService.findOneByToken(token),
      conferenceService.findOne(),
    ]);
    ticket = foundTicket;
    theme = settings?.theme ?? null;
    anchorScripture = settings?.anchorScripture ?? null;
  } catch {
    ticket = undefined;
  }

  if (!ticket || ticket.status !== "VALID") notFound();

  return (
    <main className="min-h-screen px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-3 font-display uppercase text-2xl sm:text-4xl md:text-5xl text-ink">
            Your conference pass
          </h1>
        </div>
        <TicketCard
          ticket={{
            fullName: ticket.fullName,
            code: ticket.code ?? "—",
            assembly: ticket.assembly,
            family: ticket.family,
            token,
            theme,
            anchorScripture,
            amount: ticket.amount,
          }}
        />
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-semibold text-wine">
            Return to conference
          </Link>
        </div>
      </div>
    </main>
  );
}
