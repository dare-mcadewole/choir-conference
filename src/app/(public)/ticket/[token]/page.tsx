import Link from "next/link";
import { notFound } from "next/navigation";
import * as ticketService from "@/features/ticket/service";
import { TicketCard } from "@/features/ticket/components/ticket-card";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let ticket;

  try {
    ticket = await ticketService.findOneByToken(token);
  } catch {
    ticket = undefined;
  }

  if (!ticket || ticket.status !== "VALID") notFound();

  return (
    <main className="min-h-screen px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-3 font-display uppercase text-4xl sm:text-5xl text-ink">
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
