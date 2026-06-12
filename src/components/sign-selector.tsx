"use client";

import { ZODIAC_SIGNS, ZodiacSignName } from "@/data/signs";

interface SignSelectorProps {
  selected: ZodiacSignName | "";
  onChange: (sign: ZodiacSignName) => void;
}

export function SignSelector({ selected, onChange }: SignSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center px-4">
        {ZODIAC_SIGNS.map((sign) => {
          const isActive = sign.name === selected;
          return (
            <button
              key={sign.name}
              onClick={() => onChange(sign.name)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-sans
                transition-all duration-150 whitespace-nowrap cursor-pointer
                ${
                  isActive
                    ? "bg-gold text-background font-medium shadow-sm"
                    : "bg-surface border border-gold-light text-text-secondary hover:border-gold hover:text-text-primary"
                }
              `}
            >
              <span className="text-base leading-none">{sign.symbol}</span>
              <span className="text-xs font-medium tracking-wide">
                {sign.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
