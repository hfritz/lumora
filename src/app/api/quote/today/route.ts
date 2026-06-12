import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getMoonPhaseForDate, getActiveRetrogrades } from "@/lib/ephemeris";

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

async function generateQuote(
  sign: string,
  date: string,
  moon: { phase: string; sign: string },
  retro: string
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"];

  const retroContext = retro ? `${retro} is active.` : "No major retrogrades active.";
  try {
    const groq = createGroq({ apiKey: groqKey });
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Lumora, a cosmic inspiration guide. Generate a single, short inspirational quote (1–2 sentences) for ${sign} that reflects today's cosmic energy. Today is ${date}. Moon phase: ${moon.phase} in ${moon.sign}. ${retroContext} The quote should feel warm, wise, and uplifting — not mystical jargon. No attribution. No quotation marks.`,
      prompt: `Generate today's quote for ${sign}.`,
    });
    return text.trim();
  } catch {
    return FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"];
  }
}

export async function GET(request: NextRequest) {
  const sign = request.nextUrl.searchParams.get("sign") || "Aries";
  const today = new Date().toISOString().split("T")[0];
  const moon = getMoonPhaseForDate(today);
  const retro = getActiveRetrogrades(today);

  if (!isDbConfigured()) {
    return NextResponse.json({
      quote: FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"],
      sign,
      date: today,
      moon_phase: moon.phase,
      moon_sign: moon.sign,
      retrograde: retro || null,
      source: "fallback",
    });
  }

  const sql = getDb();

  // Check cache
  const [cached] = await sql`
    SELECT quote FROM daily_quotes
    WHERE date = ${today} AND zodiac_sign = ${sign}
  `;

  if (cached) {
    return NextResponse.json({
      quote: cached.quote,
      sign,
      date: today,
      moon_phase: moon.phase,
      moon_sign: moon.sign,
      retrograde: retro || null,
      source: "cache",
    });
  }

  // Generate and cache
  const quote = await generateQuote(sign, today, moon, retro);

  await sql`
    INSERT INTO daily_quotes (date, zodiac_sign, quote)
    VALUES (${today}, ${sign}, ${quote})
    ON CONFLICT (date, zodiac_sign) DO UPDATE SET quote = EXCLUDED.quote
  `;

  return NextResponse.json({
    quote,
    sign,
    date: today,
    moon_phase: moon.phase,
    moon_sign: moon.sign,
    retrograde: retro || null,
    source: "generated",
  });
}
