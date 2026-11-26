import type { CSSProperties, ReactNode } from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export const LOGO_URL =
  "https://media.cgacchoirconference.org/images/cgac-logo.png";

export const emailColors = {
  primary: "#0839D8",
  accent: "#D4FF00",
  ink: "#121B2E",
  body: "#4B5265",
  muted: "#6B7280",
  border: "#E7E9F2",
  surface: "#F4F5F9",
  tint: "#F5F7FF",
} as const;

type BaseEmailProps = {
  preview: string;
  children: ReactNode;
};

export function BaseEmail({ preview, children }: BaseEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{preview}</title>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.topBar}>
            <Row style={styles.topBarRow}>
              <Column style={styles.topBarPrimary}>&nbsp;</Column>
              <Column style={styles.topBarAccent}>&nbsp;</Column>
            </Row>
          </Section>

          <Section style={styles.header}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src={LOGO_URL}
                  width={44}
                  height={44}
                  alt="All Choirs' Conference"
                  style={styles.logo}
                />
              </Column>
              <Column style={styles.wordmarkColumn}>
                <Text style={styles.wordmark}>ALL CHOIRS&apos; CONFERENCE</Text>
                <Text style={styles.wordmarkYear}>2027</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.rule} />

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>
              ALL CHOIRS&apos; CONFERENCE 2027 · THE ABLE MINISTER
            </Text>
            <Text style={styles.footerNote}>
              You received this email because you registered for the
              conference.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: emailColors.surface,
    color: emailColors.ink,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${emailColors.border}`,
    borderRadius: "16px",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden",
    width: "100%",
  },
  topBar: {
    backgroundColor: emailColors.primary,
    margin: 0,
    padding: 0,
  },
  topBarRow: {
    borderCollapse: "collapse",
    width: "100%",
  },
  topBarPrimary: {
    backgroundColor: emailColors.primary,
    fontSize: "0",
    height: "5px",
    lineHeight: "5px",
    padding: 0,
    width: "72%",
  },
  topBarAccent: {
    backgroundColor: emailColors.accent,
    fontSize: "0",
    height: "5px",
    lineHeight: "5px",
    padding: 0,
    width: "28%",
  },
  header: {
    padding: "26px 32px 20px",
  },
  logoColumn: {
    verticalAlign: "middle",
    width: "56px",
  },
  logo: {
    borderRadius: "12px",
    display: "block",
  },
  wordmarkColumn: {
    paddingLeft: "14px",
    verticalAlign: "middle",
  },
  wordmark: {
    color: emailColors.primary,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2.2px",
    lineHeight: "16px",
    margin: 0,
  },
  wordmarkYear: {
    color: emailColors.muted,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "2.2px",
    lineHeight: "15px",
    margin: 0,
  },
  rule: {
    borderColor: emailColors.border,
    margin: 0,
  },
  content: {
    padding: "28px 32px 32px",
  },
  footer: {
    backgroundColor: "#F8F9FC",
    borderTop: `1px solid ${emailColors.border}`,
    padding: "20px 32px 22px",
  },
  footerBrand: {
    color: emailColors.ink,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.6px",
    lineHeight: "16px",
    margin: 0,
  },
  footerNote: {
    color: emailColors.muted,
    fontSize: "11px",
    lineHeight: "18px",
    margin: "6px 0 0",
  },
} satisfies Record<string, CSSProperties>;
