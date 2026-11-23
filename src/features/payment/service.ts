import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { payments, webhookEvents } from "@/features/payment/schema";
import { registrations } from "@/features/registration/schema";
import { tickets } from "@/features/ticket/schema";

export type PaymentProvider = {
  verify(reference: string): Promise<{
    successful: boolean;
    amount: number;
    currency: string;
    raw: unknown;
  }>;
};
export const paystack: PaymentProvider = {
  async verify(reference) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" },
    );
    if (!response.ok) throw new Error("Paystack verification failed.");
    const body = (await response.json()) as {
      data: { status: string; amount: number; currency: string };
    };
    return {
      successful: body.data.status === "success",
      amount: body.data.amount / 100,
      currency: body.data.currency,
      raw: body,
    };
  },
};
export function verifyPaystackSignature(raw: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha512", secret)
    .update(raw)
    .digest("hex");
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
export async function initializePaystackCheckout({
  email,
  amount,
  registrationId,
}: {
  email: string;
  amount: number;
  registrationId: string;
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!secret || !baseUrl)
    throw new Error(
      "Payment is not configured yet. Please contact the conference team.",
    );
  const reference = `ACC27-${crypto.randomBytes(12).toString("hex")}`;
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: "NGN",
        reference,
        callback_url: `${baseUrl}/register?payment=return`,
        metadata: { registrationId },
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("Could not initiate secure checkout.");
  const body = (await response.json()) as {
    data: { authorization_url: string };
  };
  const db = getDb();
  await db.insert(payments).values({
    registrationId,
    provider: "paystack",
    reference,
    amount: String(amount),
    currency: "NGN",
  });
  return body.data.authorization_url;
}
export async function reconcileSuccessfulPayment(
  reference: string,
  eventId: string,
  payload: unknown,
) {
  const db = getDb();
  const existing = await db.query.webhookEvents.findFirst({
    where: and(
      eq(webhookEvents.provider, "paystack"),
      eq(webhookEvents.eventId, eventId),
    ),
  });
  if (existing?.processedAt) return;
  await db.transaction(async (tx) => {
    await tx
      .insert(webhookEvents)
      .values({ provider: "paystack", eventId, payload })
      .onConflictDoNothing();
    const payment = await tx.query.payments.findFirst({
      where: eq(payments.reference, reference),
    });
    if (!payment || payment.status === "SUCCESSFUL") return;
    const registration = await tx.query.registrations.findFirst({
      where: eq(registrations.id, payment.registrationId),
    });
    if (!registration || registration.status !== "PENDING_PAYMENT") return;
    const registrationCode = `ACC27-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const ticketToken = crypto.randomBytes(32).toString("base64url");
    await tx
      .update(payments)
      .set({
        status: "SUCCESSFUL",
        verifiedAt: new Date(),
        providerPayload: payload,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));
    await tx
      .update(registrations)
      .set({
        status: "CONFIRMED",
        registrationCode,
        ticketToken,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, registration.id));
    await tx
      .insert(tickets)
      .values({ registrationId: registration.id, token: ticketToken });
    await tx
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(
        and(
          eq(webhookEvents.provider, "paystack"),
          eq(webhookEvents.eventId, eventId),
        ),
      );
  });
}
