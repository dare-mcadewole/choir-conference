import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import * as ticketService from "@/features/ticket/service";

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

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/tickets/verify/${token}`;
  const qr = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#121B2E", light: "#FFFFFF" },
  });

  return (
    <main className="grid min-h-screen place-items-center bg-mist p-5">
      <article className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-ink shadow-2xl">
        <div className="p-7 text-white md:p-10">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-4 font-display text-4xl">THE ABLE MINISTER</h1>
          <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Issued to
              </p>
              <h2 className="mt-2 font-display text-3xl">{ticket.fullName}</h2>
              <div className="mt-7 grid grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-slate-400">Registration</p>
                  <p className="mt-1 font-bold text-gold">{ticket.code}</p>
                </div>
                <div>
                  <p className="text-slate-400">Family</p>
                  <p className="mt-1 font-bold">{ticket.family}</p>
                </div>
                <div>
                  <p className="text-slate-400">Assembly</p>
                  <p className="mt-1 font-bold">{ticket.assembly}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="mt-1 font-bold text-emerald-300">Valid</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-2">
              <img
                src={qr}
                width={170}
                height={170}
                alt="Ticket verification QR code"
              />
            </div>
          </div>
        </div>
        <div className="bg-gold px-7 py-4 text-center text-sm font-bold text-ink">
          Present this QR code at conference check-in.
        </div>
      </article>
      <Link href="/" className="mt-6 text-sm font-semibold text-wine">
        Return to conference
      </Link>
    </main>
  );
}
