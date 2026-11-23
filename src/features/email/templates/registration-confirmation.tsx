import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
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
    <Html>
      <Head />
      <Preview>
        Your All Choirs&apos; Conference registration is confirmed
      </Preview>
      <Body
        style={{ backgroundColor: "#f6f4ee", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "40px auto",
            padding: "32px",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#74222c", fontWeight: 700, letterSpacing: 2 }}>
            ALL CHOIRS&apos; CONFERENCE 2027
          </Text>
          <Heading>Welcome, {name}.</Heading>
          <Text>
            Your registration is confirmed. Keep your conference code handy:{" "}
            <strong>{code}</strong>.
          </Text>
          <Section style={{ padding: 16, backgroundColor: "#f6f4ee" }}>
            <Text>
              Assembly: {assembly}
              <br />
              Family: {family}
            </Text>
          </Section>
          <Button
            href={ticketUrl}
            style={{
              backgroundColor: "#74222c",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            View your ticket
          </Button>
          {whatsappUrl && (
            <Text>
              <a href={whatsappUrl}>Join your family WhatsApp group</a>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}
