"use client";

import { useState } from "react";
import { ZODIAC_SIGNS, ZodiacSignName } from "@/data/signs";

interface SignOnboardingProps {
  onComplete: (sign: ZodiacSignName) => void;
}

export function SignOnboarding({ onComplete }: SignOnboardingProps) {
  const [leaving, setLeaving] = useState(false);

  function handleSelect(sign: ZodiacSignName) {
    setLeaving(true);
    setTimeout(() => onComplete(sign), 600);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-600 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(to bottom, rgba(20,12,8,0.92) 0%, rgba(20,12,8,0.80) 60%, rgba(30,18,12,0.95) 100%)",
        backdropFilter: "blur(2px)",
      }}
    >
      <p className="text-xs font-sans tracking-widest uppercase text-white/50 mb-4">
        Welcome to Lumora
      </p>
      <h1
        className="text-4xl sm:text-5xl text-white text-center leading-tight tracking-wide mb-3 px-4"
        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
      >
        What&apos;s your sign?
      </h1>
      <p className="text-sm text-white/50 font-sans mb-10 text-center max-w-xs px-4">
        Your daily quote and cosmic guidance will be written just for you.
      </p>

      <div className="w-full max-w-xs px-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign.name}
              onClick={() => handleSelect(sign.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-sans border border-white/20 text-white/70 hover:border-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 whitespace-nowrap cursor-pointer"
            >
              <span className="text-base leading-none">{sign.symbol}</span>
              <span className="text-xs font-medium tracking-wide">{sign.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
