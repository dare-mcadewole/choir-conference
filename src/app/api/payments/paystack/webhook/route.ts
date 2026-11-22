import { NextRequest, NextResponse } from "next/server";
import {
  reconcileSuccessfulPayment,
  verifyPaystackSignature,
} from "@/lib/payments";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (
    !verifyPaystackSignature(raw, request.headers.get("x-paystack-signature"))
  )
    return new NextResponse("Unauthorized", { status: 401 });
  let event: { event?: string; data?: { reference?: string; id?: string } };

  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (
    event.event !== "charge.success" ||
    !event.data?.reference ||
    !event.data.id
  ) {
    return NextResponse.json({ received: true });
  }

  try {
    await reconcileSuccessfulPayment(
      event.data.reference,
      String(event.data.id),
      event,
    );
    return NextResponse.json({ received: true });
  } catch {
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
