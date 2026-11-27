import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import * as paymentService from "@/features/payment/service";
import { createMetadata } from "@/lib/seo";
import { BulkPaymentForm } from "./components/bulk-payment-form";

export const metadata = createMetadata({
  title: "Assembly bulk payment",
  description:
    "Calculate the total conference payment due for an assembly's registrations.",
});

export default async function BulkPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ assembly?: string }>;
}) {
  const { assembly } = await searchParams;
  let data;
  try {
    data = await paymentService.findBulkPaymentSummaries();
  } catch {
    data = {
      assemblies: [],
      rates: { student: 0, nonStudent: 0, currency: "NGN" },
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

        <div className="mx-auto mt-12 max-w-5xl">
          <p className="eyebrow">All Choirs&apos; Conference 2027</p>
          <h1 className="mt-4 font-display text-3xl uppercase md:text-5xl">
            Assembly bulk payment
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Select an assembly to see the total amount due for its
            registrations. Online payment will be enabled soon.
          </p>

          <div className="mt-10">
            <BulkPaymentForm
              assemblies={data.assemblies}
              rates={data.rates}
              initialAssemblyId={assembly}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
