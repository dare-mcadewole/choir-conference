import { randomBytes } from "crypto";

export function generateRegistrationCode(name: string) {
  const collapsedName = name.replace(" ", "").slice(0, 4);
  return `${collapsedName}-${randomBytes(3).toString("hex")}`.toUpperCase();
}

export function generateToken() {
  return randomBytes(32).toString("base64url");
}
