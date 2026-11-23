import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { registrations } from "@/features/registration/schema";
import { tickets } from "@/features/ticket/schema";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const db = getDb();
    const ticket = (
      await db
        .select({
          status: tickets.status,
          fullName: registrations.fullName,
          code: registrations.registrationCode,
        })
        .from(tickets)
        .innerJoin(registrations, eq(tickets.registrationId, registrations.id))
        .where(eq(tickets.token, token))
        .limit(1)
    )[0];
    if (!ticket || ticket.status !== "VALID")
      return NextResponse.json(
        { valid: false, status: ticket?.status ?? "NOT_FOUND" },
        { status: 404 },
      );
    return NextResponse.json({
      valid: true,
      status: ticket.status,
      name: ticket.fullName,
      registrationCode: ticket.code,
    });
  } catch {
    return NextResponse.json(
      { valid: false, status: "UNAVAILABLE" },
      { status: 503 },
    );
  }
}
