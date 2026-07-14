import { NextRequest, NextResponse, after } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { ZODIAC_SIGNS } from "@/data/signs";
import { FALLBACK_QUOTES, generateDailyContent } from "@/lib/cosmic-content";
import { isAuthorizedCronRequest, cronAuthHeader } from "@/lib/cron-auth";
import { APP_URL } from "@/lib/app-url";

// Generation is a small, fixed-size job (always exactly 12 signs, never
// scales with subscriber count), so it runs sequentially in one invocation
// rather than self-chaining — Vercel's infinite-loop protection kills a
// function that calls itself repeatedly, which a per-sign chain hits well
// before covering all 12. Sequential + a small pacing gap also keeps us
// under Groq's tokens-per-minute quota, which concurrent calls blew through.
const PACING_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  return POST(request);
}

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

  const today = new Date().toISOString().split("T")[0];
  const sql = getDb();
  const groq = createGroq({ apiKey: groqKey });
  const moon = getMoonPhaseForDate(today);
  const retro = getActiveRetrogrades(today);

  let generated = 0;
  let reused = 0;
  let failed = 0;

  for (const [i, sign] of ZODIAC_SIGNS.entries()) {
    const [cached] = await sql`
      SELECT quote, lenses FROM daily_quotes
      WHERE date = ${today} AND zodiac_sign = ${sign.name}
    `;

    if (cached?.lenses) {
      reused++;
      continue;
    }

    if (i > 0) await sleep(PACING_DELAY_MS);

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
      generated++;
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
      failed++;
    }
  }

  // Single hop to daily-send — not a chain, so this never risks Vercel's
  // loop protection.
  after(async () => {
    try {
      const res = await fetch(`${APP_URL}/api/cron/daily-send`, {
        method: "POST",
        headers: cronAuthHeader(),
      });
      if (!res.ok) {
        console.error(`[daily-generate] daily-send trigger failed: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.error("[daily-generate] failed to trigger daily-send:", err);
    }
  });

  return NextResponse.json({ date: today, generated, reused, failed });
}
