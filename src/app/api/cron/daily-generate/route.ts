import { NextRequest, NextResponse, after } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { ZODIAC_SIGNS } from "@/data/signs";
import { FALLBACK_QUOTES, generateDailyContent } from "@/lib/cosmic-content";
import { isAuthorizedCronRequest, cronAuthHeader } from "@/lib/cron-auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return POST(request);
}

// Groq's TPM quota for this model is tight enough that even a handful of
// concurrent sign generations (each a large structured-output call) blows
// through it — so each invocation generates exactly one sign, then hands
// off to the next. This keeps every single request cheap and reliably
// under maxDuration, and naturally paces requests against the rate limit
// instead of bursting them.
export async function POST(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY required" }, { status: 503 });
  }

  const index = Number(request.nextUrl.searchParams.get("i") ?? "0");
  const sign = ZODIAC_SIGNS[index];

  if (!sign) {
    return NextResponse.json({ error: `Invalid sign index ${index}` }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const sql = getDb();
  const groq = createGroq({ apiKey: groqKey });
  const moon = getMoonPhaseForDate(today);
  const retro = getActiveRetrogrades(today);

  let outcome: "generated" | "reused" | "failed";

  const [cached] = await sql`
    SELECT quote, lenses FROM daily_quotes
    WHERE date = ${today} AND zodiac_sign = ${sign.name}
  `;

  if (cached?.lenses) {
    outcome = "reused";
  } else {
    const content = await generateDailyContent(sign.name, today, moon, retro, groq);

    if (content) {
      await sql`
        INSERT INTO daily_quotes (date, zodiac_sign, quote, briefing, subject_line, featured_lens, lenses)
        VALUES (${today}, ${sign.name}, ${content.quote}, ${content.briefing}, ${content.subject_line}, ${content.featured_lens}, ${JSON.stringify(content.lenses)}::jsonb)
        ON CONFLICT (date, zodiac_sign) DO UPDATE SET
          quote = EXCLUDED.quote,
          briefing = EXCLUDED.briefing,
          subject_line = EXCLUDED.subject_line,
          featured_lens = EXCLUDED.featured_lens,
          lenses = EXCLUDED.lenses
      `;
      outcome = "generated";
    } else {
      console.error(`[daily-generate] generation failed for ${sign.name} after retries`);
      const quote = cached?.quote ?? FALLBACK_QUOTES[sign.name] ?? FALLBACK_QUOTES["Aries"];
      if (!cached) {
        await sql`
          INSERT INTO daily_quotes (date, zodiac_sign, quote)
          VALUES (${today}, ${sign.name}, ${quote})
          ON CONFLICT (date, zodiac_sign) DO NOTHING
        `;
      }
      outcome = "failed";
    }
  }

  const isLastSign = index === ZODIAC_SIGNS.length - 1;

  after(async () => {
    const next = isLastSign
      ? `${APP_URL}/api/cron/daily-send`
      : `${APP_URL}/api/cron/daily-generate?i=${index + 1}`;
    try {
      const res = await fetch(next, { method: "POST", headers: cronAuthHeader() });
      if (!res.ok) {
        console.error(`[daily-generate] chained call to ${next} failed: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.error(`[daily-generate] failed to trigger ${next}:`, err);
    }
  });

  return NextResponse.json({
    date: today,
    index,
    sign: sign.name,
    outcome,
    next: isLastSign ? "daily-send" : `daily-generate?i=${index + 1}`,
  });
}
