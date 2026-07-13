import { NextRequest, NextResponse, after } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { ZODIAC_SIGNS } from "@/data/signs";
import { FALLBACK_QUOTES, generateDailyContent } from "@/lib/cosmic-content";
import { isAuthorizedCronRequest, cronAuthHeader } from "@/lib/cron-auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

// Generation is inherently fixed-size (12 signs, independent of subscriber
// count), but firing all 12 Groq calls at once risks tripping rate limits.
// Chunking keeps concurrency bounded while still finishing well within
// a single function invocation.
const GENERATION_BATCH_SIZE = 4;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

export const maxDuration = 60;

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

  for (const batch of chunk(ZODIAC_SIGNS, GENERATION_BATCH_SIZE)) {
    await Promise.all(
      batch.map(async ({ name }) => {
        const [cached] = await sql`
          SELECT quote, lenses FROM daily_quotes
          WHERE date = ${today} AND zodiac_sign = ${name}
        `;

        if (cached?.lenses) {
          reused++;
          return;
        }

        const content = await generateDailyContent(name, today, moon, retro, groq);

        if (content) {
          await sql`
            INSERT INTO daily_quotes (date, zodiac_sign, quote, briefing, subject_line, featured_lens, lenses)
            VALUES (${today}, ${name}, ${content.quote}, ${content.briefing}, ${content.subject_line}, ${content.featured_lens}, ${JSON.stringify(content.lenses)}::jsonb)
            ON CONFLICT (date, zodiac_sign) DO UPDATE SET
              quote = EXCLUDED.quote,
              briefing = EXCLUDED.briefing,
              subject_line = EXCLUDED.subject_line,
              featured_lens = EXCLUDED.featured_lens,
              lenses = EXCLUDED.lenses
          `;
          generated++;
        } else {
          console.error(`[daily-generate] generation failed for ${name} after retries`);
          const quote = cached?.quote ?? FALLBACK_QUOTES[name] ?? FALLBACK_QUOTES["Aries"];
          if (!cached) {
            await sql`
              INSERT INTO daily_quotes (date, zodiac_sign, quote)
              VALUES (${today}, ${name}, ${quote})
              ON CONFLICT (date, zodiac_sign) DO NOTHING
            `;
          }
          failed++;
        }
      })
    );
  }

  // Content is ready — kick off the send fan-out in the background so this
  // request doesn't also carry the (potentially much larger) send workload.
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
