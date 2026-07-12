import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createGroq } from "@ai-sdk/groq";
import { sendEmail } from "@/lib/brevo";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { makeUnsubscribeToken } from "@/lib/tokens";
import { ZODIAC_SIGNS } from "@/data/signs";
import { FALLBACK_QUOTES, generateDailyContent, LENS_KEYS, type DailyContent, type LensKey } from "@/lib/cosmic-content";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

const LENS_META: Record<LensKey, { icon: string; label: string }> = {
  work: { icon: "💼", label: "Work" },
  love: { icon: "💛", label: "Love" },
  family: { icon: "🏡", label: "Family" },
  money: { icon: "💰", label: "Money" },
  self: { icon: "✨", label: "Self" },
};

function isAuthorized(request: NextRequest): boolean {
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

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY required" }, { status: 503 });
  }

  const today = new Date().toISOString().split("T")[0];
  const sql = getDb();
  const groq = createGroq({ apiKey: groqKey });
  const moon = getMoonPhaseForDate(today);
  const retro = getActiveRetrogrades(today);

  // Generate (or reuse cached) full content for all 12 signs
  interface ContentView {
    quote: string;
    subject_line: string | null;
    featured_lens: DailyContent["featured_lens"] | null;
    lenses: DailyContent["lenses"] | null;
  }
  const content: Record<string, ContentView | null> = {};

  await Promise.all(
    ZODIAC_SIGNS.map(async ({ name }) => {
      const [cached] = await sql`
        SELECT quote, subject_line, featured_lens, lenses FROM daily_quotes
        WHERE date = ${today} AND zodiac_sign = ${name}
      `;

      if (cached?.lenses) {
        content[name] = {
          quote: cached.quote,
          subject_line: cached.subject_line,
          featured_lens: cached.featured_lens,
          lenses: cached.lenses,
        };
        return;
      }

      const generated = await generateDailyContent(name, today, moon, retro, groq);

      if (generated) {
        await sql`
          INSERT INTO daily_quotes (date, zodiac_sign, quote, briefing, subject_line, featured_lens, lenses)
          VALUES (${today}, ${name}, ${generated.quote}, ${generated.briefing}, ${generated.subject_line}, ${generated.featured_lens}, ${JSON.stringify(generated.lenses)}::jsonb)
          ON CONFLICT (date, zodiac_sign) DO UPDATE SET
            quote = EXCLUDED.quote,
            briefing = EXCLUDED.briefing,
            subject_line = EXCLUDED.subject_line,
            featured_lens = EXCLUDED.featured_lens,
            lenses = EXCLUDED.lenses
        `;
        content[name] = generated;
      } else {
        const quote = cached?.quote ?? FALLBACK_QUOTES[name] ?? FALLBACK_QUOTES["Aries"];
        if (!cached) {
          await sql`
            INSERT INTO daily_quotes (date, zodiac_sign, quote)
            VALUES (${today}, ${name}, ${quote})
            ON CONFLICT (date, zodiac_sign) DO NOTHING
          `;
        }
        content[name] = { quote, subject_line: null, featured_lens: null, lenses: null };
      }
    })
  );

  // Fetch confirmed subscribers
  const subscribers = await sql`
    SELECT email, zodiac_sign FROM subscribers WHERE confirmed = true
  `;

  // Resend free tier: 100 emails/day
  const DAILY_EMAIL_CAP = 100;
  const batch = subscribers.slice(0, DAILY_EMAIL_CAP);
  if (subscribers.length > DAILY_EMAIL_CAP) {
    console.warn(
      `[daily-send] ${subscribers.length} subscribers but Resend cap is ${DAILY_EMAIL_CAP}. ${subscribers.length - DAILY_EMAIL_CAP} emails skipped.`
    );
  }

  let sent = 0;
  let failed = 0;

  for (const sub of batch) {
    const signContent = content[sub.zodiac_sign] ?? content["Aries"];
    const quote = signContent?.quote ?? FALLBACK_QUOTES[sub.zodiac_sign] ?? FALLBACK_QUOTES["Aries"];
    const subjectLine = signContent?.subject_line ?? `Your ${sub.zodiac_sign} guide for ${today}`;
    const featured = signContent?.featured_lens && signContent.lenses ? signContent.lenses[signContent.featured_lens] : null;
    const featuredMeta = signContent?.featured_lens ? LENS_META[signContent.featured_lens] : null;
    const otherLensLabels = signContent?.featured_lens
      ? LENS_KEYS.filter((k) => k !== signContent.featured_lens).map((k) => LENS_META[k].label)
      : [];

    const unsubToken = makeUnsubscribeToken(sub.email);
    const unsubUrl = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${unsubToken}`;

    try {
      await sendEmail({
        to: sub.email,
        subject: subjectLine,
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
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
              <div style="border-top:1px solid #E8D5B0;margin:0 0 24px;"></div>
              <p style="font-size:11px;color:#B0A090;font-family:sans-serif;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 24px;">${sub.zodiac_sign} · ${moon.phase} in ${moon.sign}${retro ? ` · ${retro}` : ""}</p>
              <p style="font-size:20px;font-style:italic;line-height:1.8;color:#2C2420;margin:0 0 32px;">${quote}</p>
              ${
                featured && featuredMeta
                  ? `
              <div style="border-top:1px solid #E8D5B0;margin:0 0 20px;"></div>
              <p style="font-size:11px;color:#B0A090;font-family:sans-serif;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">${featuredMeta.icon} Today's focus: ${featuredMeta.label}</p>
              <p style="font-size:15px;line-height:1.6;color:#2C2420;font-family:sans-serif;margin:0 0 20px;">${featured.teaser}</p>
              <p style="font-size:12px;color:#9E7A45;font-family:sans-serif;margin:0 0 28px;">Also today: ${otherLensLabels.join(" · ")} → <a href="${APP_URL}#lenses" style="color:#9E7A45;">See your full guide</a></p>
              `
                  : ""
              }
              <a href="${APP_URL}${featured ? "#lenses" : ""}" style="display:inline-block;border:1.5px solid #C9A96E;color:#C9A96E;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:12px;letter-spacing:2px;font-family:sans-serif;text-transform:uppercase;">Open Lumora</a>
            </div>
            <!-- Footer -->
            <div style="background:#E8E3DA;padding:20px 32px;">
              <p style="font-size:11px;color:#B0A090;font-family:sans-serif;margin:0;"><a href="${unsubUrl}" style="color:#B0A090;">Unsubscribe</a></p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    date: today,
    quotes_generated: Object.keys(content).length,
    subscribers: subscribers.length,
    sent,
    failed,
    skipped: subscribers.length - batch.length,
  });
}
