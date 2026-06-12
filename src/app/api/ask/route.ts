import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { getDb, isDbConfigured } from "@/lib/db";
import { getCosmicContext } from "@/lib/ephemeris";

const DAILY_LIMIT_ANONYMOUS = 1;
const DAILY_LIMIT_SUBSCRIBER = 5;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function getQuestionCount(key: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  const sql = getDb();
  const [row] = await sql`
    SELECT COUNT(*) AS count FROM question_log
    WHERE email = ${key} AND asked_at >= CURRENT_DATE
  `;
  return Number(row?.count ?? 0);
}

async function isSubscriber(email: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const sql = getDb();
  const [row] = await sql`
    SELECT id FROM subscribers WHERE email = ${email} AND confirmed = true
  `;
  return !!row;
}

async function logQuestion(key: string): Promise<void> {
  if (!isDbConfigured()) return;
  const sql = getDb();
  await sql`INSERT INTO question_log (email) VALUES (${key})`;
}

export async function POST(request: NextRequest) {
  let body: { email?: string; question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const question = (body.question ?? "").trim().slice(0, 500);

  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Subscribers are rate-limited by email (confirmed account).
  // Anonymous users are rate-limited by IP so changing email doesn't bypass the limit.
  const subscriber = await isSubscriber(email);
  const rateLimitKey = subscriber ? email : getClientIp(request);
  const limit = subscriber ? DAILY_LIMIT_SUBSCRIBER : DAILY_LIMIT_ANONYMOUS;

  const count = await getQuestionCount(rateLimitKey);
  const remaining = Math.max(0, limit - count);

  if (count >= limit) {
    return NextResponse.json(
      {
        error: "daily_limit_reached",
        message: subscriber
          ? "You've used all your questions for today. Come back tomorrow."
          : "You've used your free question for today. Subscribe for 5 questions per day.",
        questions_remaining: 0,
        is_subscriber: subscriber,
      },
      { status: 429 }
    );
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({
      answer: "The stars are aligning — set up GROQ_API_KEY to enable cosmic Q&A.",
      questions_remaining: remaining - 1,
      is_subscriber: subscriber,
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const cosmicContext = getCosmicContext(today);

  try {
    const groq = createGroq({ apiKey: groqKey });
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Lumora, a cosmic guidance assistant. Answer only questions about astrology, zodiac signs, moon phases, planetary events, Mercury retrograde, and spiritual energy. Keep answers short (2–4 sentences), warm, and practical. Today is ${today}. Cosmic context: ${cosmicContext}. If the question is off-topic, respond exactly: "That's outside my cosmic expertise. Ask me something about the stars, moon, or planetary energy."`,
      prompt: `[User question]: ${question}`,
    });

    await logQuestion(rateLimitKey);

    return NextResponse.json({
      answer: text,
      questions_remaining: remaining - 1,
      is_subscriber: subscriber,
    });
  } catch {
    return NextResponse.json(
      { error: "The stars are quiet right now. Try again in a moment." },
      { status: 503 }
    );
  }
}
