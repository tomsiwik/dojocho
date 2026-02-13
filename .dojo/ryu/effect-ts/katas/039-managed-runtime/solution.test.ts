import { describe, expect, it } from "vitest";
import { makeRuntime, greetWith, fullLifecycle } from "./solution.js";

describe("039 — Managed Runtime", () => {
  it("makeRuntime creates a runtime", async () => {
    const runtime = makeRuntime();
    expect(runtime).toBeDefined();
    await runtime.dispose();
  });

  it("greetWith runs an effect using the runtime", async () => {
    const runtime = makeRuntime();
    const result = greetWith(runtime, "Alice");
    expect(result).toBe("Hello, Alice!");
    await runtime.dispose();
  });

  it("greetWith works with different names", async () => {
    const runtime = makeRuntime();
    expect(greetWith(runtime, "Bob")).toBe("Hello, Bob!");
    expect(greetWith(runtime, "Charlie")).toBe("Hello, Charlie!");
    await runtime.dispose();
  });

  it("fullLifecycle creates, uses, and disposes runtime", async () => {
    const result = await fullLifecycle("World");
    expect(result).toBe("Hello, World!");
  });
});
