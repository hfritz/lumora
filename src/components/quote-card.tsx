interface QuoteCardProps {
  quote: string;
  briefing: string | null;
  sign: string;
  moonPhase: string;
  moonSign: string;
  retrograde: string | null;
  loading?: boolean;
}

const ZODIAC_EMOJIS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const MOON_EMOJIS: Record<string, string> = {
  "New Moon": "🌑",
  "Waxing Crescent": "🌒",
  "First Quarter": "🌓",
  "Waxing Gibbous": "🌔",
  "Full Moon": "🌕",
  "Waning Gibbous": "🌖",
  "Last Quarter": "🌗",
  "Waning Crescent": "🌘",
};

const PLANET_EMOJIS: Record<string, string> = {
  Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅",
  Neptune: "♆", Pluto: "♇",
};

const MOON_MEANINGS: Record<string, string> = {
  "New Moon": "Fresh start, set intentions",
  "Waxing Crescent": "Plant seeds, take first steps",
  "First Quarter": "Push through resistance",
  "Waxing Gibbous": "Refine & build momentum",
  "Full Moon": "Peak energy, release & celebrate",
  "Waning Gibbous": "Reflect & share what you've learned",
  "Last Quarter": "Let go of what no longer serves",
  "Waning Crescent": "Rest, restore, prepare to begin again",
};

const PLANET_MEANINGS: Record<string, string> = {
  Mercury: "Communication & thinking feel off — review, don't rush",
  Venus: "Love & values need revisiting",
  Mars: "Pause on bold moves & confrontations",
  Jupiter: "Growth plans may need a rethink",
  Saturn: "Rules & structures are up for review",
  Uranus: "Expect the unexpected in routines",
  Neptune: "Intuition is foggy — trust slowly",
  Pluto: "Deep transformation is being reconsidered",
};

function parseRetrograde(retrograde: string): { planet: string; sign: string } {
  const match = retrograde.match(/^(\w+) retrograde in (\w+)/);
  return match
    ? { planet: match[1], sign: match[2] }
    : { planet: retrograde, sign: "" };
}

interface ChipProps {
  label: string;
  icon: string;
  primary: string;
  secondary?: string;
  meaning?: string;
}

function Chip({ label, icon, primary, secondary, meaning }: ChipProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3 rounded-2xl border border-gold-light/50 bg-white/30 flex-1 min-w-0">
      <span className="text-[9px] font-sans tracking-widest uppercase text-text-muted">
        {label}
      </span>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-xs font-sans text-text-primary text-center leading-tight">
        {primary}
      </span>
      {secondary && (
        <span className="text-[10px] font-sans text-text-muted text-center leading-tight">
          {secondary}
        </span>
      )}
      {meaning && (
        <span className="mt-1 text-[10px] font-sans text-text-muted text-center leading-tight italic border-t border-gold-light/40 pt-1 w-full">
          {meaning}
        </span>
      )}
    </div>
  );
}

export function QuoteCard({
  quote,
  briefing,
  sign,
  moonPhase,
  moonSign,
  retrograde,
  loading = false,
}: QuoteCardProps) {
  const retroData = retrograde ? parseRetrograde(retrograde) : null;

  return (
    <div className="relative w-full mx-auto">
      {/* Decorative orb */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(232,213,176,0.55) 0%, rgba(250,247,242,0) 70%)",
          filter: "blur(32px)",
          transform: "scale(1.3)",
        }}
      />

      {/* Card */}
      <div
        className="rounded-2xl border border-gold-light/60 p-6 sm:p-8 text-center"
        style={{
          background: "rgba(250,247,242,0.70)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 32px rgba(180,140,100,0.10)",
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-3/4 rounded-full bg-gold-light/60 animate-pulse" />
            <div className="h-5 w-1/2 rounded-full bg-gold-light/40 animate-pulse" />
          </div>
        ) : (
          <p
            className="text-2xl sm:text-3xl leading-relaxed text-text-primary italic"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {quote}
          </p>
        )}

        <div className="mt-6 flex flex-nowrap justify-center gap-2">
          <Chip
            label="Your Sign"
            icon={ZODIAC_EMOJIS[sign] ?? "✨"}
            primary={sign}
            meaning="Today's guidance is written for you"
          />
          <Chip
            label="Moon"
            icon={MOON_EMOJIS[moonPhase] ?? "🌙"}
            primary={moonPhase}
            secondary={`in ${moonSign}`}
            meaning={MOON_MEANINGS[moonPhase]}
          />
          {retroData && (
            <Chip
              label="Retrograde"
              icon={PLANET_EMOJIS[retroData.planet] ?? "↩"}
              primary={`${retroData.planet} in ${retroData.sign}`}
              meaning={PLANET_MEANINGS[retroData.planet]}
            />
          )}
        </div>

        {briefing && (
          <div className="mt-5 pt-5 border-t border-gold-light/40">
            <p className="text-sm font-sans text-text-secondary leading-relaxed text-center">
              {briefing}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
