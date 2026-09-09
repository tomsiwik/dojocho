/** Decorative estimate, not live learner telemetry. Stable within each UTC hour. */
export function getLearningCount(now = Date.now()): number {
  const hour = Math.floor(now / 3_600_000);
  let seed = Math.imul(hour ^ (hour >>> 16), 0x45d9f3b);
  seed = (seed ^ (seed >>> 16)) >>> 0;
  const change = (seed % 4) + 1;
  return Math.max(1, 6 + ((seed >>> 2) % 2 === 0 ? change : -change));
}
