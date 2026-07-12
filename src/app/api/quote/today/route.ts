import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";
import { FALLBACK_QUOTES, generateDailyContent, type DailyContent } from "@/lib/cosmic-content";

interface ContentView {
  quote: string;
  briefing: string | null;
  subject_line: string | null;
  featured_lens: DailyContent["featured_lens"] | null;
  lenses: DailyContent["lenses"] | null;
}

function jsonResponse(
  content: ContentView | null,
  sign: string,
  today: string,
  moon: { phase: string; sign: string },
  retro: string,
  source: "fallback" | "cache" | "generated"
) {
  return NextResponse.json({
    quote: content?.quote ?? (FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"]),
    briefing: content?.briefing ?? null,
    subject_line: content?.subject_line ?? null,
    featured_lens: content?.featured_lens ?? null,
    lenses: content?.lenses ?? null,
    sign,
    date: today,
    moon_phase: moon.phase,
    moon_sign: moon.sign,
    retrograde: retro || null,
    source,
  });
}

export async function GET(request: NextRequest) {
  const sign = request.nextUrl.searchParams.get("sign") || "Aries";
  const today = new Date().toISOString().split("T")[0];
  const moon = getMoonPhaseForDate(today);
  const retro = getActiveRetrogrades(today);

  if (!isDbConfigured()) {
    return jsonResponse(null, sign, today, moon, retro, "fallback");
  }

  const sql = getDb();

  const [cached] = await sql`
    SELECT quote, briefing, subject_line, featured_lens, lenses FROM daily_quotes
    WHERE date = ${today} AND zodiac_sign = ${sign}
  `;

  if (cached?.lenses) {
    return jsonResponse(
      {
        quote: cached.quote,
        briefing: cached.briefing,
        subject_line: cached.subject_line,
        featured_lens: cached.featured_lens,
        lenses: cached.lenses,
      },
      sign,
      today,
      moon,
      retro,
      "cache"
    );
  }

  const groqKey = process.env.GROQ_API_KEY;
  const content = groqKey
    ? await generateDailyContent(sign, today, moon, retro, createGroq({ apiKey: groqKey }))
    : null;

  if (!content) {
    if (cached) {
      // Older cached row from before the lenses feature — keep serving its quote/briefing.
      return jsonResponse(
        { quote: cached.quote, briefing: cached.briefing, subject_line: null, featured_lens: null, lenses: null },
        sign,
        today,
        moon,
        retro,
        "cache"
      );
    }
    return jsonResponse(null, sign, today, moon, retro, "fallback");
  }

  await sql`
    INSERT INTO daily_quotes (date, zodiac_sign, quote, briefing, subject_line, featured_lens, lenses)
    VALUES (${today}, ${sign}, ${content.quote}, ${content.briefing}, ${content.subject_line}, ${content.featured_lens}, ${JSON.stringify(content.lenses)}::jsonb)
    ON CONFLICT (date, zodiac_sign) DO UPDATE SET
      quote = EXCLUDED.quote,
      briefing = EXCLUDED.briefing,
      subject_line = EXCLUDED.subject_line,
      featured_lens = EXCLUDED.featured_lens,
      lenses = EXCLUDED.lenses
  `;

  return jsonResponse(content, sign, today, moon, retro, "generated");
}
