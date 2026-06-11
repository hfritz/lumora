import ephemeris from "@/data/ephemeris.json";

export function getMoonPhaseForDate(dateStr: string): {
  phase: string;
  sign: string;
} {
  const phases = ephemeris.moon_phases;
  const exact = phases.find((p) => p.date === dateStr);
  if (exact) return { phase: exact.phase, sign: exact.sign };

  const target = new Date(dateStr).getTime();
  const sorted = [...phases].sort(
    (a, b) =>
      Math.abs(new Date(a.date).getTime() - target) -
      Math.abs(new Date(b.date).getTime() - target)
  );
  return sorted[0]
    ? { phase: sorted[0].phase, sign: sorted[0].sign }
    : { phase: "Waxing Moon", sign: "Scorpio" };
}

export function getActiveRetrogrades(dateStr: string): string {
  const active = ephemeris.retrogrades.filter(
    (r) => r.start <= dateStr && dateStr <= r.end
  );
  if (!active.length) return "";
  return active.map((r) => `${r.planet} retrograde in ${r.sign}`).join(", ");
}

export function getCosmicContext(dateStr: string): string {
  const moon = getMoonPhaseForDate(dateStr);
  const retro = getActiveRetrogrades(dateStr);
  const parts = [`${moon.phase} in ${moon.sign}`];
  if (retro) parts.push(retro);
  return parts.join(". ");
}
