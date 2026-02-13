import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { Config, Logger, ConfigLive, LoggerLive, getEndpoint } from "./solution.js";

describe("012 — Layers", () => {
  it("ConfigLive provides baseUrl", () => {
    const program = Effect.gen(function* () {
      const config = yield* Config;
      return config.baseUrl;
    });
    const result = Effect.runSync(Effect.provide(program, ConfigLive));
    expect(result).toBe("https://api.example.com");
  });

  it("getEndpoint returns full URL", () => {
    const TestLayer = Layer.merge(
      Layer.succeed(Config, { baseUrl: "https://test.com" }),
      Layer.succeed(Logger, { log: () => Effect.void }),
    );
    const result = Effect.runSync(Effect.provide(getEndpoint, TestLayer));
    expect(result).toBe("https://test.com/users");
  });
});
