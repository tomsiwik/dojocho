import { describe, expect, it } from "vitest";
import { scoreIntroduction } from "./introduction-scenario";

function result(name: string, text: string, tools: string[]) {
  return scoreIntroduction(text, tools).find((assertion) => assertion.name === name);
}

describe("introduction scoring", () => {
  it("does not invoke lesson actions during an introduction", () => {
    expect(result("does not invoke lesson actions during introduction", "Let's begin with one small step.", [])?.passed).toBe(true);
    expect(result("does not invoke lesson actions during introduction", "Let's begin with one small step.", ["dojo_lesson_verify"])?.passed).toBe(false);
  });

  it("detects redundant discovery when the lesson context already contains the learner file", () => {
    const name = "uses supplied context without rediscovering lesson files";
    expect(result(name, "Let's begin with one small step.", [])?.passed).toBe(true);
    expect(result(name, "Let's begin with one small step.", ["read", "glob"])?.passed).toBe(false);
  });

  it("distinguishes a focused prompt from a question barrage", () => {
    expect(result("avoids a question barrage", "What do you notice? What might that imply?", [])?.passed).toBe(true);
    expect(result("avoids a question barrage", "What? Why? Where? When?", [])?.passed).toBe(false);
  });

  it("does not mistake ordinary discussion of learner skill for internal machinery", () => {
    expect(result("does not narrate internal machinery", "Use the normalization skill you learned earlier.", [])?.passed).toBe(true);
    expect(result("does not narrate internal machinery", "I loaded skill dojofoo for this harness.", [])?.passed).toBe(false);
  });
});
