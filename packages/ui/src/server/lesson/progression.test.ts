import { describe, expect, it } from "vitest";
import { wantsNextLesson } from "./service";

describe("Sensei progression intent", () => {
  it.each([
    "Move on",
    "next",
    "Continue",
    "finish it up and move to the next kata",
    "please advance to the next lesson",
  ])("recognizes %j as moving to the next lesson", (answer) => {
    expect(wantsNextLesson({ answer: [answer] })).toBe(true);
  });

  it("does not treat review requests as progression", () => {
    expect(wantsNextLesson({ answer: ["Review this with me"] })).toBe(false);
  });
});
