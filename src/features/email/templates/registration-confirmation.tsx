import type { CSSProperties } from "react";
import {
  Button,
  Column,
  Heading,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { BaseEmail, emailColors } from "./base";

export function RegistrationConfirmationEmail({
  name,
  code,
  assembly,
  family,
  ticketUrl,
  whatsappUrl,
}: {
  name: string;
  code: string;
  assembly: string;
  family: string;
  ticketUrl: string;
  whatsappUrl?: string;
}) {
  return (
    <BaseEmail preview="Your All Choirs' Conference registration is confirmed">
      <Text style={styles.eyebrow}>REGISTRATION CONFIRMED</Text>
      <Heading style={styles.heading}>Welcome, {name}.</Heading>
      <Text style={styles.paragraph}>
        Your place at the All Choirs&apos; Conference 2027 is secure. Keep your
        registration code handy for check-in.
      </Text>

      <Section style={styles.codePanel}>
        <Text style={styles.codeLabel}>REGISTRATION CODE</Text>
        <Text style={styles.codeValue}>{code}</Text>
      </Section>

      <Section style={styles.details}>
        <Row>
          <Column style={styles.detailColumn}>
            <Text style={styles.detailLabel}>ASSEMBLY</Text>
            <Text style={styles.detailValue}>{assembly}</Text>
          </Column>
          <Column style={styles.detailColumn}>
            <Text style={styles.detailLabel}>MUSIC GAMES FAMILY</Text>
            <Text style={styles.detailValue}>{family}</Text>
          </Column>
        </Row>
      </Section>

      <Button href={ticketUrl} style={styles.button}>
        VIEW YOUR TICKET
      </Button>

      {whatsappUrl && (
        <Text style={styles.whatsapp}>
          <Link href={whatsappUrl} style={styles.link}>
            Join your family WhatsApp group
          </Link>
        </Text>
      )}

      <Text style={styles.note}>
        Present your ticket QR code at conference check-in.
      </Text>
    </BaseEmail>
  );
}

const styles = {
  eyebrow: {
    color: emailColors.primary,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "2.4px",
    lineHeight: "14px",
    margin: "0 0 8px",
  },
  heading: {
    color: emailColors.ink,
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
    lineHeight: "34px",
    margin: "0 0 14px",
  },
  paragraph: {
    color: emailColors.body,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 22px",
  },
  codePanel: {
    backgroundColor: emailColors.tint,
    border: `1px solid ${emailColors.border}`,
    borderLeft: `3px solid ${emailColors.accent}`,
    borderRadius: "12px",
    margin: "0 0 22px",
    padding: "16px 18px",
  },
  codeLabel: {
    color: emailColors.primary,
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "2px",
    lineHeight: "14px",
    margin: 0,
  },
  codeValue: {
    color: emailColors.ink,
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "1px",
    lineHeight: "30px",
    margin: "4px 0 0",
  },
  details: {
    borderBottom: `1px solid ${emailColors.border}`,
    borderTop: `1px solid ${emailColors.border}`,
    margin: "0 0 26px",
    padding: "14px 0",
  },
  detailColumn: {
    paddingRight: "12px",
    verticalAlign: "top",
    width: "50%",
  },
  detailLabel: {
    color: emailColors.muted,
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "1.6px",
    lineHeight: "14px",
    margin: 0,
  },
  detailValue: {
    color: emailColors.ink,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    margin: "3px 0 0",
  },
  button: {
    backgroundColor: emailColors.accent,
    borderRadius: "10px",
    color: emailColors.primary,
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    lineHeight: "16px",
    padding: "14px 22px",
    textDecoration: "none",
  },
  whatsapp: {
    fontSize: "13px",
    lineHeight: "20px",
    margin: "18px 0 0",
  },
  link: {
    color: emailColors.primary,
    fontWeight: 600,
    textDecoration: "underline",
  },
  note: {
    color: emailColors.muted,
    fontSize: "11px",
    lineHeight: "18px",
    margin: "26px 0 0",
  },
} satisfies Record<string, CSSProperties>;
