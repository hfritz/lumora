"use client";

import { useRef, useState } from "react";

type LensKey = "work" | "love" | "family" | "money" | "self";

interface Lens {
  teaser: string;
  detail: string;
}

interface TodaysLensesProps {
  lenses: Record<LensKey, Lens> | null;
  featuredLens: LensKey | null;
  loading?: boolean;
}

const LENS_META: Record<LensKey, { icon: string; label: string }> = {
  work: { icon: "💼", label: "Work" },
  love: { icon: "💛", label: "Love" },
  family: { icon: "🏡", label: "Family" },
  money: { icon: "💰", label: "Money" },
  self: { icon: "✨", label: "Self" },
};

const LENS_ORDER: LensKey[] = ["work", "love", "family", "money", "self"];

export function TodaysLenses({ lenses, featuredLens, loading = false }: TodaysLensesProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div id="lenses" className="w-full scroll-mt-20">
        <div className="flex gap-4 overflow-hidden">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 w-[85%] shrink-0 rounded-2xl bg-gold-light/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!lenses || !featuredLens) return null;

  const orderedKeys = [featuredLens, ...LENS_ORDER.filter((k) => k !== featuredLens)];

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild instanceof HTMLElement ? track.firstElementChild.offsetWidth + 16 : 1;
    setActiveIndex(Math.round(track.scrollLeft / cardWidth));
  }

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild instanceof HTMLElement ? track.firstElementChild.offsetWidth + 16 : 0;
    track.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  }

  return (
    <div id="lenses" className="w-full scroll-mt-20">
      <h3
        className="text-2xl text-text-primary text-center w-full mb-4"
        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
      >
        <span className="text-gold-light select-none">✦</span> Your cosmic guidance for different aspects of
        your life <span className="text-gold-light select-none">✦</span>
      </h3>

      <div className="relative w-full mx-auto">
        <div
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(232,213,176,0.6) 0%, rgba(250,247,242,0) 70%)",
            filter: "blur(28px)",
            transform: "scale(1.15)",
          }}
        />
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {orderedKeys.map((key) => {
            const lens = lenses[key];
            const meta = LENS_META[key];
            const isFeatured = key === featuredLens;
            return (
              <div
                key={key}
                className="snap-center shrink-0 w-[85%] sm:w-[380px] rounded-2xl border border-gold/50 p-6 sm:p-8"
                style={{
                  background: "linear-gradient(135deg, #F0E4D4 0%, #E8D5B0 100%)",
                  boxShadow: "0 8px 32px rgba(180,140,100,0.18)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl leading-none">{meta.icon}</span>
                  {isFeatured ? (
                    <span
                      className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-sans font-medium tracking-widest uppercase"
                      style={{ background: "#C9A96E", color: "#FAF7F2" }}
                    >
                      {meta.label}
                    </span>
                  ) : (
                    <span
                      className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-sans font-medium tracking-widest uppercase border"
                      style={{ borderColor: "#C9A96E", color: "#9E7A45" }}
                    >
                      {meta.label}
                    </span>
                  )}
                </div>
                <p
                  className="text-xl sm:text-2xl leading-snug text-text-primary mb-3"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  {lens.teaser}
                </p>
                <p className="text-sm font-sans text-text-secondary leading-relaxed">{lens.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {orderedKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => scrollToIndex(i)}
            aria-label={`Show ${LENS_META[key].label}`}
            className="h-1.5 rounded-full transition-all cursor-pointer"
            style={{
              width: i === activeIndex ? "18px" : "6px",
              background: i === activeIndex ? "#C9A96E" : "#E8D5B0",
            }}
          />
        ))}
      </div>
    </div>
  );
}
