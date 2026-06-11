interface QuoteCardProps {
  quote: string;
  sign: string;
  moonPhase: string;
  moonSign: string;
  retrograde: string | null;
  loading?: boolean;
}

export function QuoteCard({
  quote,
  sign,
  moonPhase,
  moonSign,
  retrograde,
  loading = false,
}: QuoteCardProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
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
        className="rounded-2xl border border-gold-light/60 p-8 sm:p-10 text-center"
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

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-text-muted font-sans tracking-wider uppercase">
          <span>{sign}</span>
          <span className="text-gold-light">·</span>
          <span>
            {moonPhase} in {moonSign}
          </span>
          {retrograde && (
            <>
              <span className="text-gold-light">·</span>
              <span className="text-gold-dark">{retrograde}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
