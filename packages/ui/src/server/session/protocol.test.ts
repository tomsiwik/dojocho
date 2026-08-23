import { describe, expect, it } from "vitest";
import { error, notification, parseRequest, result } from "./protocol";

describe("session JSON-RPC", () => {
  it("uses the standard method and params envelope without routing context", () => {
    expect(parseRequest(JSON.stringify({
      jsonrpc: "2.0",
      id: 7,
      method: "lesson.check",
      params: {},
    }))).toEqual({ jsonrpc: "2.0", id: 7, method: "lesson.check", params: {} });
  });

  it("creates standard responses and notifications", () => {
    expect(result(7, { passed: 2 })).toEqual({ jsonrpc: "2.0", id: 7, result: { passed: 2 } });
    expect(error(7, -32_000, "failed")).toEqual({
      jsonrpc: "2.0",
      id: 7,
      error: { code: -32_000, message: "failed" },
    });
    expect(notification("agent.message.delta", { text: "hello" })).toEqual({
      jsonrpc: "2.0",
      method: "agent.message.delta",
      params: { text: "hello" },
    });
  });
});
