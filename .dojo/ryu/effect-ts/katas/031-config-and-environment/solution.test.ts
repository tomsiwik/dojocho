import { Config, ConfigProvider, Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { getAppName, getPort, getAppConfig } from "./solution.js";

const TestConfig = ConfigProvider.fromMap(
  new Map([
    ["APP_NAME", "my-app"],
    ["PORT", "8080"],
  ]),
);

const withConfig = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.provide(effect, Layer.setConfigProvider(TestConfig));

describe("031 — Config and Environment", () => {
  it("getAppName reads APP_NAME config", () => {
    const result = Effect.runSync(withConfig(getAppName));
    expect(result).toBe("my-app");
  });

  it("getPort reads PORT config as number", () => {
    const result = Effect.runSync(withConfig(getPort));
    expect(result).toBe(8080);
  });

  it("getPort falls back to 3000 when PORT is missing", () => {
    const emptyConfig = ConfigProvider.fromMap(new Map([["APP_NAME", "app"]]));
    const result = Effect.runSync(
      Effect.provide(getPort, Layer.setConfigProvider(emptyConfig)),
    );
    expect(result).toBe(3000);
  });

  it("getAppConfig returns both name and port", () => {
    const result = Effect.runSync(withConfig(getAppConfig));
    expect(result).toEqual({ name: "my-app", port: 8080 });
  });
});
