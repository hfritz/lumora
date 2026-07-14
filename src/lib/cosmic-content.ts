import { APICallError, generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export const FALLBACK_QUOTES: Record<string, string> = {
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

export const LENS_KEYS = ["work", "love", "family", "money", "self"] as const;
export type LensKey = (typeof LENS_KEYS)[number];

const lensSchema = z.object({
  teaser: z.string().min(25).describe("One full, evocative sentence — not a fragment."),
  detail: z
    .string()
    .min(200)
    .describe(
      "3-4 full sentences naming the specific feeling this person is likely experiencing in this life area today, why, and what to do about it."
    ),
});

const dailyContentSchema = z.object({
  quote: z
    .string()
    .min(50)
    .describe(
      "An evocative, complete inspirational quote, 1-2 full flowing sentences with real imagery and weight — not a short punchy tagline. No attribution, no quotation marks."
    ),
  briefing: z
    .string()
    .min(260)
    .describe(
      "A rich, personal 4-sentence cosmic briefing that opens by naming the specific emotion the reader is likely feeling today, addressed directly to them by name."
    ),
  subject_line: z
    .string()
    .max(70)
    .describe("A short, punchy email subject line (under 60 characters) teasing the featured lens for today."),
  featured_lens: z.enum(LENS_KEYS).describe("The single most relevant lens for this sign today."),
  lenses: z.object({
    work: lensSchema,
    love: lensSchema,
    family: lensSchema,
    money: lensSchema,
    self: lensSchema,
  }),
});

export type DailyContent = z.infer<typeof dailyContentSchema>;

const GENERATION_ATTEMPTS = 2;
// Fallback if a 429 doesn't carry a parseable retry-after (shouldn't happen
// with Groq in practice, but keeps us from retrying into the same window).
const DEFAULT_RETRY_DELAY_MS = 12_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Groq's TPM rate limit is a rolling 60s window, and its 429s tell us
// exactly how long until enough of it frees up (retry-after header, backed
// by the same cooldown named in the error message) — waiting that long
// instead of a fixed guess means we don't retry into a still-exhausted
// window, and don't over-wait once it's actually clear.
function retryDelayFromError(err: unknown): number {
  if (APICallError.isInstance(err) && err.statusCode === 429) {
    const header = err.responseHeaders?.["retry-after"];
    const seconds = header ? Number(header) : NaN;
    if (!Number.isNaN(seconds) && seconds > 0) {
      return seconds * 1000 + 1_000; // small buffer past the boundary
    }
  }
  return DEFAULT_RETRY_DELAY_MS;
}

export async function generateDailyContent(
  sign: string,
  date: string,
  moon: { phase: string; sign: string },
  retro: string,
  groq: ReturnType<typeof createGroq>
): Promise<DailyContent | null> {
  for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
    const { content, error } = await attemptGeneration(sign, date, moon, retro, groq);
    if (content) return content;
    if (attempt < GENERATION_ATTEMPTS) await sleep(retryDelayFromError(error));
  }
  return null;
}

async function attemptGeneration(
  sign: string,
  date: string,
  moon: { phase: string; sign: string },
  retro: string,
  groq: ReturnType<typeof createGroq>
): Promise<{ content: DailyContent | null; error?: unknown }> {
  const retroContext = retro ? `${retro} is active.` : "No major retrogrades active.";
  const moonContext = `Moon phase: ${moon.phase} in ${moon.sign}.`;

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      // The AI SDK's own default retries (3 attempts) resend the full
      // request on every retry, which just burns more tokens into a
      // rate-limited quota. We own retry/backoff at the caller level instead.
      maxRetries: 0,
      // Default reasoning effort burns a large, variable number of hidden
      // "thinking" tokens before the model writes the JSON — occasionally
      // enough to run out of completion budget mid-object (observed: valid
      // JSON truncated right before the last lens key). Low effort is
      // plenty for this task and leaves headroom for the full 5-lens object.
      providerOptions: { groq: { reasoningEffort: "low" } },
      schema: dailyContentSchema,
      system: `You are Lumora, a cosmic guidance and inspiration guide. Today is ${date}. ${moonContext} ${retroContext} Write everything for ${sign}. This must read as personal, not a generic horoscope template — center it on what ${sign} is likely FEELING today (name the specific emotion), and tie that feeling to ${sign}'s known personality traits, before giving practical guidance. Tone: warm, wise, emotionally attuned, richly descriptive — write in full, flowing sentences, never terse taglines or sentence fragments. Plain language, no mystical jargon, address the reader directly as "you" and by their sign name (${sign}).

Generate:
- quote: a single evocative inspirational quote, 1-2 complete, richly descriptive sentences, explicitly grounded in TODAY'S actual moon phase and sign${retro ? " and the active retrograde" : ""} (name the moon phase and "${moon.sign}" directly, the way an astrologer would, e.g. "As the moon grows full in the intense waters of Scorpio..."), reflecting what that means for ${sign} specifically. Give it real weight and imagery — this is the emotional headline of the whole reading, not vague cosmic flavor text.
- briefing: a full 4-sentence cosmic briefing, written the way a perceptive friend would explain today to ${sign}. Open by naming the specific feeling or emotional undercurrent ${sign} is likely experiencing today (e.g. "Today, you're likely to feel..."), addressing them by name. Then explain why, connecting it to both the moon phase${retro ? " and retrograde" : ""} AND ${sign}'s known personality traits. Then give practical, relational guidance — how to navigate conversations, relationships, and their own inner emotional experience today.
- subject_line: a punchy, specific email subject line teasing the single most relevant life area for ${sign} today. Do not use a generic template like "Your sign guide for [date]" — make it feel written for today.
- featured_lens: pick exactly ONE of work, love, family, money, self as the most relevant lens for ${sign} today, based on today's transits.
- lenses: for EACH of the 5 keys (work, love, family, money, self), write a full one-sentence teaser and a substantive 3-4 sentence detail. Each detail must name the specific feeling ${sign} is likely to experience in that life area today, tied to their personality traits, then give practical guidance. Every lens gets real, complete, emotionally personal content, not just the featured one — treat all 5 with equal care.`,
      prompt: `Generate today's full cosmic guidance for ${sign}.`,
    });
    return { content: object };
  } catch (err) {
    console.error(`[cosmic-content] generation failed for ${sign}:`, err);
    return { content: null, error: err };
  }
}
