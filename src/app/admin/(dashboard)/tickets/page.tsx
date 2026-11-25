import { Search, Ticket } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import * as ticketService from "@/features/ticket/service";

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

function TicketStatus({ status }: { status: string }) {
  const styles =
    status === "VALID"
      ? "bg-emerald-50 text-emerald-700"
      : status === "USED"
        ? "bg-blue-50 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const tickets = await ticketService.findAdminTickets(q);
  const validCount = tickets.filter((ticket) => ticket.status === "VALID").length;
  const usedCount = tickets.filter((ticket) => ticket.status === "USED").length;
  const cancelledCount = tickets.filter(
    (ticket) => ticket.status === "CANCELLED",
  ).length;

  return (
    <>
      <AdminPageHeader
        title="Tickets"
        description="Review issued tickets and their check-in status."
      />

      <section
        aria-label="Ticket summary"
        className="mt-6 grid gap-3 sm:grid-cols-3"
      >
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Tickets in results</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {tickets.length.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Valid</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {validCount.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Used / cancelled</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {usedCount.toLocaleString()} / {cancelledCount.toLocaleString()}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Ticket directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? `${tickets.length} matches for “${q}”`
                : `${tickets.length} issued tickets`}
            </p>
          </div>
          <form
            action="/admin/tickets"
            method="get"
            role="search"
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-sm"
          >
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, email, phone, or registration code"
              aria-label="Search tickets"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="text-xs font-semibold text-[#6263d2] hover:text-[#4546b5]"
            >
              Search
            </button>
          </form>
        </div>

        {tickets.length ? (
          <div className="mt-5 divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Ticket size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {ticket.fullName}
                      </h3>
                      <TicketStatus status={ticket.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {ticket.email} · {ticket.phone}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {ticket.registrationCode
                        ? `Registration ${ticket.registrationCode}`
                        : "Registration code pending"}
                      {" · "}
                      {ticket.assembly ?? "No assembly"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-xs text-slate-600">
                    Issued {dateFormatter.format(ticket.issuedAt)}
                  </p>
                  {ticket.usedAt && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Checked in {dateFormatter.format(ticket.usedAt)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-12 text-center">
            <Ticket className="mx-auto text-slate-300" size={26} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {q ? "No matching tickets" : "No tickets found"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? "Try another name, email, phone number, or registration code."
                : "Tickets will appear here after registrations are confirmed."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
