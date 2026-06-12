import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { signConfirmToken, makeUnsubscribeToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/brevo";

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

  const token = await signConfirmToken(email);
  const confirmUrl = `${APP_URL}/api/confirm?token=${token}`;
  const unsubToken = makeUnsubscribeToken(email);
  const unsubUrl = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;

  const { error } = await sendEmail({
    to: email,
    subject: "Confirm your Lumora subscription",
    html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;background:#FAF7F2;color:#2C2420;">
        <!-- Hero image header -->
        <img src="${APP_URL}/hero.jpg" width="480" height="220" alt="" style="width:100%;max-width:480px;height:220px;display:block;object-fit:cover;object-position:center 20%;">
        <!-- Brand -->
        <div style="padding:28px 32px 0;text-align:center;">
          <p style="font-size:11px;color:#B0A090;font-family:sans-serif;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Your daily cosmic guide</p>
          <p style="font-size:20px;font-weight:300;letter-spacing:6px;color:#C9A96E;text-transform:uppercase;margin:0;">Lumora</p>
        </div>
        <!-- Body -->
        <div style="padding:32px 32px 40px;">
          <div style="border-top:1px solid #E8D5B0;margin:0 0 28px;"></div>
          <p style="font-size:11px;color:#B0A090;font-family:sans-serif;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">${zodiac_sign} · Welcome</p>
          <p style="font-size:20px;line-height:1.7;margin:0 0 12px;">Your daily cosmic guide is almost ready.</p>
          <p style="font-size:15px;color:#7A6B5D;line-height:1.7;margin:0 0 32px;">Click below to confirm and start receiving your daily quote every morning.</p>
          <a href="${confirmUrl}" style="display:inline-block;background:#C9A96E;color:#FAF7F2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:12px;letter-spacing:2px;font-family:sans-serif;font-weight:500;text-transform:uppercase;">Confirm subscription</a>
        </div>
        <!-- Footer -->
        <div style="background:#E8E3DA;padding:20px 32px;">
          <p style="font-size:11px;color:#B0A090;font-family:sans-serif;margin:0;line-height:1.7;">If you didn't request this, you can safely ignore this email.<br><a href="${unsubUrl}" style="color:#B0A090;">Unsubscribe</a></p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("[subscribe] Brevo error:", error);
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
  }

  return NextResponse.json({ status: "confirmation_sent" });
}
