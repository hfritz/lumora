import { NextRequest, NextResponse } from "next/server";
import ephemeris from "@/data/ephemeris.json";

const FALLBACK_QUOTES: Record<string, string> = {
  Aries: "Your energy is magnetic today — let your fire lead, not your fear.",
  Taurus:
    "What you nurture in stillness will bloom in ways you cannot yet imagine.",
  Gemini:
    "Two paths appear before you. Both are right. Trust the one that excites you more.",
  Cancer:
    "Your sensitivity is not a weakness — it is how the universe speaks through you.",
  Leo: "Shine without apology. The world is brighter when you are fully yourself.",
  Virgo:
    "Release the need for perfection today. The imperfect thing done is worth more than the perfect thing imagined.",
  Libra:
    "Balance is not stillness — it is a constant, graceful adjustment. You already know how.",
  Scorpio:
    "What feels like an ending is simply the universe clearing space for something greater.",
  Sagittarius:
    "The horizon you seek is closer than it appears. Keep moving toward it.",
  Capricorn:
    "Your patience is building something no shortcut could create. Trust the process.",
  Aquarius:
    "Your vision of what could be is not idealism — it is prophecy. Keep believing.",
  Pisces:
    "The dream you keep returning to is not an escape. It is a direction.",
};

function getTodayMoonPhase(): { phase: string; sign: string } {
  const today = new Date().toISOString().split("T")[0];
  const phases = ephemeris.moon_phases;

  const exact = phases.find((p) => p.date === today);
  if (exact) return { phase: exact.phase, sign: exact.sign };

  const sorted = [...phases].sort((a, b) => {
    const da = Math.abs(new Date(a.date).getTime() - Date.now());
    const db = Math.abs(new Date(b.date).getTime() - Date.now());
    return da - db;
  });

  return sorted[0]
    ? { phase: sorted[0].phase, sign: sorted[0].sign }
    : { phase: "Waxing Moon", sign: "Scorpio" };
}

function getActiveRetrogrades(): string {
  const today = new Date().toISOString().split("T")[0];
  const active = ephemeris.retrogrades.filter(
    (r) => r.start <= today && today <= r.end
  );
  if (active.length === 0) return "";
  return active.map((r) => `${r.planet} retrograde in ${r.sign}`).join(", ");
}

export async function GET(request: NextRequest) {
  const sign = request.nextUrl.searchParams.get("sign") || "Aries";
  const today = new Date().toISOString().split("T")[0];
  const moonPhase = getTodayMoonPhase();
  const retrograde = getActiveRetrogrades();

  // With Groq + Supabase configured: check daily_quotes table, generate if missing.
  // Without env vars: return fallback quote.
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (!hasGroq) {
    return NextResponse.json({
      quote: FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"],
      sign,
      date: today,
      moon_phase: moonPhase.phase,
      moon_sign: moonPhase.sign,
      retrograde: retrograde || null,
      source: "fallback",
    });
  }

  // TODO: Supabase cache check + Groq generation (Phase 2)
  return NextResponse.json({
    quote: FALLBACK_QUOTES[sign] ?? FALLBACK_QUOTES["Aries"],
    sign,
    date: today,
    moon_phase: moonPhase.phase,
    moon_sign: moonPhase.sign,
    retrograde: retrograde || null,
    source: "fallback",
  });
}
