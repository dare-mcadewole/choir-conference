import { NextResponse } from "next/server";
import * as ticketService from "@/features/ticket/service";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const ticket = await ticketService.findOneForVerification(token);
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
