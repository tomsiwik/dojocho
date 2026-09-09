import { describe, expect, it } from "vitest";
import { getLearningCount } from "./learning-count";

describe("simulated learning count", () => {
  it("stays stable throughout the same UTC hour", () => {
    const start = Date.UTC(2026, 8, 6, 12);
    expect(getLearningCount(start)).toBe(getLearningCount(start + 3_599_999));
  });

  it("varies by 1–4 above or below six, always remaining positive", () => {
    const counts = new Set<number>();
    for (let hour = 0; hour < 24 * 365; hour++) {
      const count = getLearningCount(Date.UTC(2026, 0, 1) + hour * 3_600_000);
      expect(count).toBeGreaterThan(0);
      expect(Math.abs(count - 6)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(count - 6)).toBeLessThanOrEqual(4);
      counts.add(count);
    }
    expect([...counts].sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 7, 8, 9, 10]);
  });
});
