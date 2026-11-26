"use client";

import { useState } from "react";
import { Building2, ReceiptText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Picker } from "@/components/ui/picker";
import { formatCurrency } from "@/lib/utils";
import type {
  AssemblyBulkPaymentSummary,
  BulkPaymentRates,
} from "@/features/payment/service";

export function BulkPaymentForm({
  assemblies,
  rates,
  initialAssemblyId,
}: {
  assemblies: AssemblyBulkPaymentSummary[];
  rates: BulkPaymentRates;
  initialAssemblyId?: string;
}) {
  const [selectedId, setSelectedId] = useState(
    initialAssemblyId &&
      assemblies.some((assembly) => assembly.id === initialAssemblyId)
      ? initialAssemblyId
      : "",
  );
  const selected = assemblies.find((assembly) => assembly.id === selectedId);

  if (!assemblies.length) {
    return (
      <section className="rounded-2xl border-hairline border-primary-100 bg-white p-8 text-center shadow-xl shadow-zinc-100 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-50 text-primary">
          <Wallet size={26} strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-2xl uppercase text-slate-900">
          No registrations to settle yet
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Bulk payment will be available once assemblies have active
          registrations.
        </p>
      </section>
    );
  }

  const options = assemblies.map((assembly) => ({
    label: `${assembly.name} · ${assembly.totalRegistrations} registration${
      assembly.totalRegistrations === 1 ? "" : "s"
    }`,
    value: assembly.id,
  }));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-2xl border-hairline border-primary-100 bg-white p-6 shadow-xl shadow-zinc-100 sm:p-8">
        <label htmlFor="bulk-payment-assembly" className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-700">
            Assembly
          </span>
          <Picker
            id="bulk-payment-assembly"
            list={options}
            value={selectedId || null}
            onValueChange={(value) => setSelectedId(value ?? "")}
            placeholder="Select an assembly"
          />
        </label>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Choose the assembly whose registrations you want to settle.
        </p>

        {selected ? (
          <div className="mt-7">
            <div className="flex items-center gap-2 text-secondary-700">
              <ReceiptText size={18} strokeWidth={1.8} />
              <h2 className="text-sm font-semibold text-slate-900">
                Registration breakdown
              </h2>
            </div>

            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex items-start justify-between gap-4 py-3.5">
                <dt className="text-slate-600">
                  Student registrations
                  <span className="block text-[11px] text-slate-400">
                    {selected.studentRegistrations} ×{" "}
                    {formatCurrency(rates.student, rates.currency)}
                  </span>
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {formatCurrency(selected.studentAmount, rates.currency)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3.5">
                <dt className="text-slate-600">
                  Non-student registrations
                  <span className="block text-[11px] text-slate-400">
                    {selected.nonStudentRegistrations} ×{" "}
                    {formatCurrency(rates.nonStudent, rates.currency)}
                  </span>
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {formatCurrency(selected.nonStudentAmount, rates.currency)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-slate-600">Total registrations</dt>
                <dd className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {selected.totalRegistrations}
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-xs leading-5 text-primary-700">
              The total combines student and non-student rates for all active
              pending and confirmed registrations under this assembly.
            </p>
          </div>
        ) : (
          <div className="mt-7 rounded-xl border border-dashed border-primary-100 bg-primary-50/40 px-6 py-10 text-center">
            <Building2
              className="mx-auto text-primary-300"
              size={26}
              strokeWidth={1.5}
            />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Select an assembly to see its amount
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The total is calculated from its active registrations.
            </p>
          </div>
        )}
      </section>

      <aside className="flex flex-col rounded-2xl bg-primary-950 p-6 text-white shadow-xl shadow-primary-950/20 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
          Amount due
        </p>
        <p className="mt-1 font-semibold text-4xl leading-none text-secondary">
          {selected ? formatCurrency(selected.amountDue, rates.currency) : "—"}
        </p>
        <p className="mt-3 text-xs leading-5 text-white/60">
          {selected
            ? `${selected.totalRegistrations} active registration${
                selected.totalRegistrations === 1 ? "" : "s"
              } under ${selected.name}.`
            : "Select an assembly to calculate its total."}
        </p>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-xs">
          <div className="flex justify-between gap-4 text-white/60">
            <span>Student rate</span>
            <span className="font-semibold text-white">
              {formatCurrency(rates.student, rates.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-white/60">
            <span>Non-student rate</span>
            <span className="font-semibold text-white">
              {formatCurrency(rates.nonStudent, rates.currency)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled
          className="mt-6 w-full"
        >
          Proceed to payment
        </Button>
        <p className="mt-3 text-center text-[11px] leading-5 text-white/45">
          Bulk payment processing is coming soon.
        </p>
      </aside>
    </div>
  );
}
