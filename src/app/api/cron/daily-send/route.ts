import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { sendEmail } from "@/lib/brevo";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { makeUnsubscribeToken } from "@/lib/tokens";
import { ZODIAC_SIGNS } from "@/data/signs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

const FALLBACK_QUOTES: Record<string, string> = {
  Aries: "Your energy is magnetic today — let your fire lead, not your fear.",
  Taurus: "What you nurture in stillness will bloom in ways you cannot yet imagine.",
  Gemini: "Two paths appear before you. Both are right. Trust the one that excites you more.",
  Cancer: "Your sensitivity is not a weakness — it is how the universe speaks through you.",
  Leo: "Shine without apology. The world is brighter when you are fully yourself.",
  Virgo: "Release the need for perfection today. The imperfect thing done is worth more than the perfect thing imagined.",
  Libra: "Balance is not stillness — it is a constant, graceful adjustment. You already know how.",
  Scorpio: "What feels like an ending is simply the universe clearing space for something greater.",
  Sagittarius: "The horizon you seek is closer than it appears. Keep moving toward it.",
  Capricorn: "Your patience is building something no shortcut could create. Trust the process.",
  Aquarius: "Your vision of what could be is not idealism — it is prophecy. Keep believing.",
  Pisces: "The dream you keep returning to is not an escape. It is a direction.",
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

async function generateQuoteAndBriefingForSign(
  sign: string,
  date: string,
  groq: ReturnType<typeof createGroq>
): Promise<{ quote: string; briefing: string }> {
  const moon = getMoonPhaseForDate(date);
  const retro = getActiveRetrogrades(date);
  const retroContext = retro ? `${retro} is active.` : "No major retrogrades active.";

  try {
    const [quoteResult, briefingResult] = await Promise.all([
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are Lumora, a cosmic inspiration guide. Generate a single, short inspirational quote (1–2 sentences) for ${sign} that reflects today's cosmic energy. Today is ${date}. Moon phase: ${moon.phase} in ${moon.sign}. ${retroContext} The quote should feel warm, wise, and uplifting — not mystical jargon. No attribution. No quotation marks.`,
        prompt: `Generate today's quote for ${sign}.`,
      }),
      generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are Lumora, a cosmic guidance guide. Write a 2–3 sentence cosmic briefing for ${sign} for today (${date}). Explain how the ${moon.phase} moon in ${moon.sign}${retro ? ` and ${retro}` : ""} combine to shape today's energy specifically for ${sign}. Be practical and specific — tell the reader what this means for their day and what to do with it. Write directly to the reader using "you". Plain language, no jargon, warm tone.`,
        prompt: `Write today's cosmic briefing for ${sign}.`,
      }),
    ]);
    return { quote: quoteResult.text.trim(), briefing: briefingResult.text.trim() };
  } catch {
    return { quote: FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"], briefing: "" };
  }
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

  // Generate all 12 sign quotes + briefings
  const quotes: Record<string, string> = {};
  await Promise.all(
    ZODIAC_SIGNS.map(async ({ name }) => {
      const [cached] = await sql`
        SELECT quote FROM daily_quotes WHERE date = ${today} AND zodiac_sign = ${name}
      `;
      if (cached) {
        quotes[name] = cached.quote;
      } else {
        const { quote, briefing } = await generateQuoteAndBriefingForSign(name, today, groq);
        quotes[name] = quote;
        await sql`
          INSERT INTO daily_quotes (date, zodiac_sign, quote, briefing)
          VALUES (${today}, ${name}, ${quote}, ${briefing || null})
          ON CONFLICT (date, zodiac_sign) DO UPDATE SET quote = EXCLUDED.quote, briefing = EXCLUDED.briefing
        `;
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
    const quote = quotes[sub.zodiac_sign] ?? quotes["Aries"];
    const unsubToken = makeUnsubscribeToken(sub.email);
    const unsubUrl = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${unsubToken}`;

    try {
      await sendEmail({
        to: sub.email,
        subject: `Your ${sub.zodiac_sign} guide for ${today}`,
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
              <p style="font-size:20px;font-style:italic;line-height:1.8;color:#2C2420;margin:0 0 40px;">${quote}</p>
              <a href="${APP_URL}" style="display:inline-block;border:1.5px solid #C9A96E;color:#C9A96E;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:12px;letter-spacing:2px;font-family:sans-serif;text-transform:uppercase;">Open Lumora</a>
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
    quotes_generated: Object.keys(quotes).length,
    subscribers: subscribers.length,
    sent,
    failed,
    skipped: subscribers.length - batch.length,
  });
}
