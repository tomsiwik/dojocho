import { describe, expect, it } from "vitest";
import { formatActivityLabel } from "./thinking-steps";

describe("formatActivityLabel", () => {
  it("separates every timed activity label with a middle dot", () => {
    expect(formatActivityLabel("Waiting", "3s")).toBe("Waiting · 3s");
    expect(formatActivityLabel("Working", "12s")).toBe("Working · 12s");
    expect(formatActivityLabel("Worked", "1m 2s")).toBe("Worked · 1m 2s");
  });
});
