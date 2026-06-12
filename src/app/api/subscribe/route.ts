import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb, isDbConfigured } from "@/lib/db";
import { signConfirmToken, makeUnsubscribeToken } from "@/lib/tokens";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

export async function POST(request: NextRequest) {
  let body: { email?: string; zodiac_sign?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const zodiac_sign = (body.zodiac_sign ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!zodiac_sign) {
    return NextResponse.json({ error: "Zodiac sign required" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({
      status: "mock",
      message: "Set up DATABASE_URL to enable subscriptions.",
    });
  }

  const sql = getDb();

  const [existing] = await sql`
    SELECT id, confirmed FROM subscribers WHERE email = ${email}
  `;

  if (existing?.confirmed) {
    return NextResponse.json({ status: "already_subscribed" });
  }

  await sql`
    INSERT INTO subscribers (email, zodiac_sign, confirmed)
    VALUES (${email}, ${zodiac_sign}, false)
    ON CONFLICT (email) DO UPDATE SET zodiac_sign = EXCLUDED.zodiac_sign
  `;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({
      status: "pending_email",
      message: "Subscriber saved. Set RESEND_API_KEY to send confirmation emails.",
    });
  }

  const token = await signConfirmToken(email);
  const confirmUrl = `${APP_URL}/api/confirm?token=${token}`;
  const unsubToken = makeUnsubscribeToken(email);
  const unsubUrl = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Lumora <hello@lumora.app>",
    to: email,
    subject: "Confirm your Lumora subscription",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FAF7F2; color: #2C2420;">
        <p style="font-size: 28px; font-weight: 300; letter-spacing: 4px; color: #C9A96E; text-transform: uppercase; margin: 0 0 32px;">Lumora</p>
        <p style="font-size: 20px; line-height: 1.6; margin: 0 0 16px;">Your daily cosmic guide for <strong>${zodiac_sign}</strong> is almost ready.</p>
        <p style="font-size: 15px; color: #7A6B5D; line-height: 1.6; margin: 0 0 32px;">Click below to confirm your subscription and start receiving your daily quote every morning.</p>
        <a href="${confirmUrl}" style="display: inline-block; background: #C9A96E; color: #FAF7F2; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; letter-spacing: 1px; font-family: sans-serif; font-weight: 500;">Confirm subscription</a>
        <p style="font-size: 12px; color: #B0A090; margin-top: 40px; line-height: 1.6;">If you didn't request this, you can safely ignore this email.<br><a href="${unsubUrl}" style="color: #B0A090;">Unsubscribe</a></p>
      </div>
    `,
  });

  return NextResponse.json({ status: "confirmation_sent" });
}
