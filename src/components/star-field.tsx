"use client";

const STARS = [
  { top: 6,  left: 8,  size: 2.5, delay: 0,   duration: 2.8, glow: true  },
  { top: 11, left: 22, size: 1.5, delay: 1.4,  duration: 3.6, glow: false },
  { top: 4,  left: 38, size: 3,   delay: 0.7,  duration: 2.2, glow: true  },
  { top: 18, left: 48, size: 1.5, delay: 2.1,  duration: 4.0, glow: false },
  { top: 9,  left: 55, size: 2.5, delay: 0.3,  duration: 3.1, glow: true  },
  { top: 14, left: 67, size: 1.5, delay: 1.8,  duration: 2.6, glow: false },
  { top: 5,  left: 74, size: 3,   delay: 0.9,  duration: 3.8, glow: true  },
  { top: 20, left: 82, size: 1.5, delay: 2.5,  duration: 2.4, glow: false },
  { top: 7,  left: 91, size: 2.5, delay: 0.5,  duration: 3.3, glow: true  },
  { top: 25, left: 15, size: 1.5, delay: 1.1,  duration: 4.2, glow: false },
  { top: 30, left: 32, size: 3,   delay: 2.8,  duration: 2.9, glow: true  },
  { top: 22, left: 44, size: 1.5, delay: 0.6,  duration: 3.7, glow: false },
  { top: 35, left: 58, size: 2.5, delay: 1.9,  duration: 2.5, glow: true  },
  { top: 28, left: 72, size: 1.5, delay: 3.2,  duration: 4.1, glow: false },
  { top: 40, left: 88, size: 3,   delay: 0.4,  duration: 2.7, glow: true  },
  { top: 15, left: 95, size: 1.5, delay: 2.0,  duration: 3.4, glow: false },
  { top: 42, left: 6,  size: 2.5, delay: 1.6,  duration: 2.3, glow: true  },
  { top: 38, left: 25, size: 1.5, delay: 0.8,  duration: 3.9, glow: false },
  { top: 48, left: 40, size: 3,   delay: 2.3,  duration: 2.8, glow: true  },
  { top: 33, left: 52, size: 1.5, delay: 1.0,  duration: 4.3, glow: false },
  { top: 45, left: 63, size: 2.5, delay: 3.5,  duration: 3.0, glow: true  },
  { top: 50, left: 78, size: 1.5, delay: 0.2,  duration: 2.6, glow: false },
  { top: 12, left: 86, size: 3,   delay: 1.7,  duration: 3.2, glow: true  },
  { top: 55, left: 18, size: 1.5, delay: 2.9,  duration: 4.0, glow: false },
  { top: 60, left: 35, size: 2.5, delay: 0.1,  duration: 2.9, glow: true  },
  { top: 3,  left: 60, size: 1.5, delay: 3.8,  duration: 3.5, glow: false },
  { top: 52, left: 70, size: 3,   delay: 1.3,  duration: 2.4, glow: true  },
  { top: 58, left: 90, size: 1.5, delay: 2.6,  duration: 3.7, glow: false },
  { top: 23, left: 5,  size: 2.5, delay: 0.9,  duration: 3.1, glow: true  },
  { top: 47, left: 97, size: 1.5, delay: 1.5,  duration: 4.4, glow: false },
  { top: 8,  left: 42, size: 1.5, delay: 3.0,  duration: 2.7, glow: false },
  { top: 36, left: 80, size: 2.5, delay: 2.2,  duration: 3.6, glow: true  },
  { top: 19, left: 10, size: 3,   delay: 0.6,  duration: 2.2, glow: true  },
  { top: 62, left: 50, size: 1.5, delay: 1.8,  duration: 3.9, glow: false },
  { top: 44, left: 14, size: 2.5, delay: 3.3,  duration: 2.8, glow: true  },
];

export function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1;  transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.6); }
        }
        @keyframes twinkle-glow {
          0%, 100% { opacity: 0.12; transform: scale(1);   box-shadow: 0 0 0px 0px rgba(232,213,176,0); }
          50%       { opacity: 1;   transform: scale(1.8); box-shadow: 0 0 6px 3px rgba(232,213,176,0.7); }
        }
      `}</style>
      {STARS.map((star, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "50%",
            backgroundColor: "white",
            animation: `${star.glow ? "twinkle-glow" : "twinkle"} ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
