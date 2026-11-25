import { CreditCard, Search } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import * as paymentService from "@/features/payment/service";

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

function PaymentStatus({ status }: { status: string }) {
  const styles =
    status === "SUCCESSFUL"
      ? "bg-emerald-50 text-emerald-700"
      : status === "PENDING"
        ? "bg-amber-50 text-amber-700"
        : status === "FAILED"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const payments = await paymentService.findAdminPayments(q);
  const successfulCount = payments.filter(
    (payment) => payment.status === "SUCCESSFUL",
  ).length;
  const pendingCount = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;
  const successfulAmounts = payments.reduce((totals, payment) => {
    if (payment.status === "SUCCESSFUL") {
      totals.set(
        payment.currency,
        (totals.get(payment.currency) ?? 0) + Number(payment.amount),
      );
    }
    return totals;
  }, new Map<string, number>());

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Review payment attempts and verification results."
      />

      <section
        aria-label="Payment summary"
        className="mt-6 grid gap-3 sm:grid-cols-3"
      >
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Records in results</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {payments.length.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Successful</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {successfulCount.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Successful amount</p>
          <div className="mt-2 space-y-0.5">
            {successfulAmounts.size ? (
              [...successfulAmounts].map(([currency, amount]) => (
                <p
                  key={currency}
                  className="text-xl font-semibold text-slate-900"
                >
                  {currency}{" "}
                  {amount.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              ))
            ) : (
              <p className="text-2xl font-semibold text-slate-900">—</p>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {pendingCount.toLocaleString()} pending verification
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Payment records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? `${payments.length} matches for “${q}”`
                : `${payments.length} payment attempts`}
            </p>
          </div>
          <form
            action="/admin/payments"
            method="get"
            role="search"
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-sm"
          >
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Reference, name, email, or phone"
              aria-label="Search payments"
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

        {payments.length ? (
          <div className="mt-5 divide-y divide-slate-100">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <CreditCard size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {payment.fullName}
                      </h3>
                      <PaymentStatus status={payment.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {payment.email} · {payment.phone}
                    </p>
                    <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                      {payment.reference}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {payment.registrationCode
                        ? `Registration ${payment.registrationCode}`
                        : "Registration pending"}
                      {" · "}
                      {payment.provider}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {payment.currency}{" "}
                    {Number(payment.amount).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Created {dateFormatter.format(payment.createdAt)}
                  </p>
                  {payment.verifiedAt && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Verified {dateFormatter.format(payment.verifiedAt)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f9fc] px-4 py-12 text-center">
            <CreditCard className="mx-auto text-slate-300" size={26} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {q ? "No matching payments" : "No payment records found"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {q
                ? "Try another reference or attendee detail."
                : "Payment attempts will appear here when registrations require payment."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
