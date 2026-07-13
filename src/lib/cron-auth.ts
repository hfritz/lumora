import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode — no secret configured
  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace("Bearer ", "");
  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(provided));
  } catch {
    return false;
  }
}

export function cronAuthHeader(): Record<string, string> {
  const secret = process.env.CRON_SECRET;
  return secret ? { Authorization: `Bearer ${secret}` } : {};
}
