import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { getDb } from "@/db";
import { assemblies } from "@/features/assembly/schema";
import { emailLogs } from "@/features/email/schema";
import {
  conferenceFamilies,
  conferenceFamilyAssemblies,
} from "@/features/family/schema";
import { registrations } from "@/features/registration/schema";
import { RegistrationConfirmationEmail } from "./templates/registration-confirmation";

type EmailStatus = "SENT" | "FAILED" | "SKIPPED";

async function logEmail({
  registrationId,
  recipient,
  providerId,
  status,
  error,
}: {
  registrationId: string;
  recipient: string;
  providerId?: string | null;
  status: EmailStatus;
  error?: string | null;
}) {
  try {
    const db = getDb();
    await db.insert(emailLogs).values({
      registrationId,
      type: "registration-confirmation",
      recipient,
      providerId: providerId ?? null,
      status,
      error: error ?? null,
    });
  } catch (logError) {
    console.error("Could not record the confirmation email log.", logError);
  }
}

export async function sendRegistrationConfirmationEmail(
  registrationId: string,
) {
  let recipient = "";

  try {
    const db = getDb();
    const [registration] = await db
      .select({
        fullName: registrations.fullName,
        email: registrations.email,
        code: registrations.registrationCode,
        token: registrations.ticketToken,
        assembly: assemblies.name,
        family: conferenceFamilies.name,
        familyAlias: conferenceFamilies.alias,
        whatsappUrl: conferenceFamilies.whatsappUrl,
      })
      .from(registrations)
      .innerJoin(assemblies, eq(registrations.assemblyId, assemblies.id))
      .leftJoin(
        conferenceFamilyAssemblies,
        eq(assemblies.id, conferenceFamilyAssemblies.assemblyId),
      )
      .leftJoin(
        conferenceFamilies,
        eq(conferenceFamilyAssemblies.familyId, conferenceFamilies.id),
      )
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration?.code || !registration.token) return false;

    recipient = registration.email;

    const alreadySent = await db.query.emailLogs.findFirst({
      where: and(
        eq(emailLogs.registrationId, registrationId),
        eq(emailLogs.type, "registration-confirmation"),
        eq(emailLogs.status, "SENT"),
      ),
      columns: { id: true },
    });
    if (alreadySent) return true;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !from || !appUrl) {
      await logEmail({
        registrationId,
        recipient,
        status: "SKIPPED",
        error: "Resend is not configured.",
      });
      return false;
    }

    const ticketUrl = `${appUrl.replace(/\/+$/, "")}/ticket/${encodeURIComponent(registration.token)}`;
    const html = await render(
      <RegistrationConfirmationEmail
        name={registration.fullName}
        code={registration.code}
        assembly={registration.assembly}
        family={registration.family ?? "Not assigned"}
        familyAlias={registration.familyAlias}
        ticketUrl={ticketUrl}
        whatsappUrl={registration.whatsappUrl ?? undefined}
      />,
    );

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: registration.email,
      subject: "Your All Choirs' Conference 2027 registration is confirmed",
      html,
    });

    if (error) throw new Error(error.message);

    await logEmail({
      registrationId,
      recipient,
      providerId: data?.id,
      status: "SENT",
    });
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email error.";

    console.error(
      `Could not send the registration confirmation email${
        recipient ? ` to ${recipient}` : ""
      }.`,
      error,
    );

    if (recipient) {
      await logEmail({
        registrationId,
        recipient,
        status: "FAILED",
        error: message,
      });
    }
    return false;
  }
}
