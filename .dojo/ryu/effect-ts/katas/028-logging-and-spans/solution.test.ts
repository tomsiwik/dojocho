import { Effect, Logger, Ref, LogLevel, HashMap } from "effect";
import { describe, expect, it } from "vitest";
import { logAndReturn, logWithContext, withTracking } from "@/katas/028-logging-and-spans/solution.js";

// Helper: create a test logger that captures messages to a Ref
const makeTestLogger = () =>
  Effect.gen(function* () {
    const logs = yield* Ref.make<string[]>([]);
    const logger = Logger.make(({ message }) => {
      Ref.update(logs, (arr) => [...arr, String(message)]).pipe(Effect.runSync);
    });
    return { logs, logger };
  });

describe("028 — Logging and Spans", () => {
  it("logAndReturn logs the message and returns 'done'", () =>
    Effect.gen(function* () {
      const { logs, logger } = yield* makeTestLogger();
      const result = yield* logAndReturn("hello").pipe(
        Logger.withMinimumLogLevel(LogLevel.All),
        Effect.provide(Logger.replace(Logger.defaultLogger, logger)),
      );
      expect(result).toBe("done");
      const captured = yield* Ref.get(logs);
      expect(captured).toContain("hello");
    }).pipe(Effect.runSync));

  it("logWithContext annotates logs with requestId", () =>
    Effect.gen(function* () {
      const annotations = yield* Ref.make<Record<string, unknown>>({});
      const logger = Logger.make(({ annotations: ann }) => {
        const obj: Record<string, unknown> = {};
        HashMap.forEach(ann, (value, key) => {
          obj[key] = value;
        });
        Ref.update(annotations, () => obj).pipe(Effect.runSync);
      });
      yield* logWithContext("req-1", "processing").pipe(
        Logger.withMinimumLogLevel(LogLevel.All),
        Effect.provide(Logger.replace(Logger.defaultLogger, logger)),
      );
      const captured = yield* Ref.get(annotations);
      expect(captured).toHaveProperty("requestId", "req-1");
    }).pipe(Effect.runSync));

  it("withTracking preserves the effect result", () => {
    const result = Effect.runSync(withTracking("my-span", Effect.succeed(42)));
    expect(result).toBe(42);
  });
});
