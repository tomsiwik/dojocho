import { describe, expect, it, vi } from "vitest";
import { createCodexHarnessAdapter } from "./codex";
import { configureOpenCodeSessionModel, createOpenCodeHarnessAdapter } from "./opencode";
import { dojofooHarness, harnessAdapter } from "./registry";

describe("ACP harness adapters", () => {
  it("encapsulates Codex process configuration", () => {
    const adapter = createCodexHarnessAdapter({ PATH: "/bin", CODEX_CONFIG: JSON.stringify({ model: "gpt-5" }) });
    const process = adapter.process({ root: "/tmp/lesson", developerInstructions: "Teach this lesson" });

    expect(adapter.kind).toBe("codex");
    expect(process.args[0]).toContain("codex-acp");
    expect(JSON.parse(process.environment.CODEX_CONFIG ?? "{}")).toEqual(expect.objectContaining({
      model: "gpt-5",
      developer_instructions: "Teach this lesson",
    }));
    expect(adapter.encodeResource({ uri: "dojofoo://lesson", text: "private" })).toBe("private");
  });

  it("encapsulates OpenCode process, resource, and model configuration", async () => {
    const connection = { setSessionConfigOption: vi.fn().mockResolvedValue({}) };
    const adapter = createOpenCodeHarnessAdapter({
      OPENCODE_BIN: "/opt/opencode",
      OPENCODE_CONFIG_CONTENT: JSON.stringify({ model: "anthropic/claude" }),
    });

    expect(adapter.process({ root: "/tmp/lesson", developerInstructions: "Teach" })).toEqual(expect.objectContaining({
      command: "/opt/opencode",
      args: ["acp", "--cwd", "/tmp/lesson"],
    }));
    expect(adapter.encodeResource({ uri: "dojofoo://lesson", text: "private" }))
      .toBe('<context ref="dojofoo://lesson">\nprivate\n</context>');
    await adapter.configureSession(connection as never, "session-1");
    expect(connection.setSessionConfigOption).toHaveBeenCalledWith({
      sessionId: "session-1",
      configId: "model",
      value: "anthropic/claude",
    });
  });

  it("selects registered harnesses and rejects unknown names", () => {
    expect(dojofooHarness({})).toBe("opencode");
    expect(harnessAdapter("codex").kind).toBe("codex");
    expect(() => dojofooHarness({ DOJOFOO_HARNESS: "unknown" })).toThrow("Unsupported Dojofoo harness");
  });

  it("isolates model discovery for OpenCode versions without ACP config options", async () => {
    const connection = {
      setSessionConfigOption: vi.fn().mockRejectedValue(new Error("Method not found")),
      request: vi.fn().mockResolvedValue({}),
    };
    const adapter = createOpenCodeHarnessAdapter(
      { OPENCODE_CONFIG_CONTENT: JSON.stringify({ model: "anthropic/claude" }) },
      "/tmp/home",
      () => ["opencode/free", "anthropic/claude"],
    );

    await expect(adapter.configureSession(connection as never, "session-1", [])).resolves.toEqual([
      expect.objectContaining({
        category: "model",
        currentValue: "anthropic/claude",
        options: [
          expect.objectContaining({ group: "opencode" }),
          expect.objectContaining({ group: "anthropic" }),
        ],
      }),
    ]);
  });

  it("preserves the actionable error when both OpenCode model operations fail", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const failure = new Error("legacy model selection failed");
    const connection = {
      setSessionConfigOption: vi.fn().mockRejectedValue(new Error("Method not found")),
      request: vi.fn().mockRejectedValue(failure),
    } as unknown as import("@agentclientprotocol/sdk").ClientSideConnection;

    await expect(configureOpenCodeSessionModel(connection, "session-1", "openai/codex"))
      .rejects.toBe(failure);
    expect(warning).toHaveBeenCalledWith(
      "OpenCode rejected both ACP model configuration methods",
      failure,
    );
    warning.mockRestore();
  });
});
