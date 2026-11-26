import { NextRequest, NextResponse } from "next/server";
import * as emailService from "@/features/email/service";
import * as paymentService from "@/features/payment/service";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (
    !paymentService.verifyPaystackSignature(
      raw,
      request.headers.get("x-paystack-signature"),
    )
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
    const reconciled = await paymentService.reconcileSuccessfulPayment(
      event.data.reference,
      String(event.data.id),
      event,
    );
    if (reconciled) {
      await emailService
        .sendRegistrationConfirmationEmail(reconciled.registrationId)
        .catch((error) => {
          console.error(
            "Could not send the registration confirmation email.",
            error,
          );
        });
    }
    return NextResponse.json({ received: true });
  } catch {
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
