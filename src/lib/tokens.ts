import { SignJWT, jwtVerify } from "jose";
import { createHmac, timingSafeEqual } from "crypto";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signConfirmToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyConfirmToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}

export function makeUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? "dev-unsub-secret";
  return createHmac("sha256", secret).update(email).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = makeUnsubscribeToken(email);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
