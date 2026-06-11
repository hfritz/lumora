"use client";

const STARS = [
  { top: 6, left: 8, size: 1.5, delay: 0, duration: 2.8 },
  { top: 11, left: 22, size: 1, delay: 1.4, duration: 3.6 },
  { top: 4, left: 38, size: 2, delay: 0.7, duration: 2.2 },
  { top: 18, left: 48, size: 1, delay: 2.1, duration: 4.0 },
  { top: 9, left: 55, size: 1.5, delay: 0.3, duration: 3.1 },
  { top: 14, left: 67, size: 1, delay: 1.8, duration: 2.6 },
  { top: 5, left: 74, size: 2, delay: 0.9, duration: 3.8 },
  { top: 20, left: 82, size: 1, delay: 2.5, duration: 2.4 },
  { top: 7, left: 91, size: 1.5, delay: 0.5, duration: 3.3 },
  { top: 25, left: 15, size: 1, delay: 1.1, duration: 4.2 },
  { top: 30, left: 32, size: 2, delay: 2.8, duration: 2.9 },
  { top: 22, left: 44, size: 1, delay: 0.6, duration: 3.7 },
  { top: 35, left: 58, size: 1.5, delay: 1.9, duration: 2.5 },
  { top: 28, left: 72, size: 1, delay: 3.2, duration: 4.1 },
  { top: 40, left: 88, size: 2, delay: 0.4, duration: 2.7 },
  { top: 15, left: 95, size: 1, delay: 2.0, duration: 3.4 },
  { top: 42, left: 6, size: 1.5, delay: 1.6, duration: 2.3 },
  { top: 38, left: 25, size: 1, delay: 0.8, duration: 3.9 },
  { top: 48, left: 40, size: 2, delay: 2.3, duration: 2.8 },
  { top: 33, left: 52, size: 1, delay: 1.0, duration: 4.3 },
  { top: 45, left: 63, size: 1.5, delay: 3.5, duration: 3.0 },
  { top: 50, left: 78, size: 1, delay: 0.2, duration: 2.6 },
  { top: 12, left: 86, size: 2, delay: 1.7, duration: 3.2 },
  { top: 55, left: 18, size: 1, delay: 2.9, duration: 4.0 },
  { top: 60, left: 35, size: 1.5, delay: 0.1, duration: 2.9 },
  { top: 3, left: 60, size: 1, delay: 3.8, duration: 3.5 },
  { top: 52, left: 70, size: 2, delay: 1.3, duration: 2.4 },
  { top: 58, left: 90, size: 1, delay: 2.6, duration: 3.7 },
  { top: 23, left: 5, size: 1.5, delay: 0.9, duration: 3.1 },
  { top: 47, left: 97, size: 1, delay: 1.5, duration: 4.4 },
  { top: 8, left: 42, size: 1, delay: 3.0, duration: 2.7 },
  { top: 36, left: 80, size: 1.5, delay: 2.2, duration: 3.6 },
  { top: 19, left: 10, size: 2, delay: 0.6, duration: 2.2 },
  { top: 62, left: 50, size: 1, delay: 1.8, duration: 3.9 },
  { top: 44, left: 14, size: 1.5, delay: 3.3, duration: 2.8 },
];

export function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.3); }
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
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
