import { createRequire } from "node:module";
import type { HarnessAdapter } from "./adapter";

const require = createRequire(import.meta.url);

export function codexRuntimeEnvironment(
  developerInstructions: string,
  baseEnvironment: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  let configured: Record<string, unknown> = {};
  const serialized = baseEnvironment.CODEX_CONFIG;
  if (serialized) {
    const parsed = JSON.parse(serialized) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("CODEX_CONFIG must contain a JSON object");
    }
    configured = parsed as Record<string, unknown>;
  }
  return {
    ...baseEnvironment,
    INITIAL_AGENT_MODE: "agent-full-access",
    CODEX_CONFIG: JSON.stringify({
      ...configured,
      sandbox_mode: "danger-full-access",
      approval_policy: "never",
      developer_instructions: developerInstructions,
    }),
  };
}

export function createCodexHarnessAdapter(environment: NodeJS.ProcessEnv = process.env): HarnessAdapter {
  return {
    kind: "codex",
    configureSession: async () => undefined,
    setModel: async (connection, sessionId, modelId) => {
      const response = await connection.setSessionConfigOption({ sessionId, configId: "model", value: modelId });
      return response.configOptions;
    },
    encodeResource: (resource) => resource.text,
    process: (runtime) => ({
      command: process.execPath,
      args: [require.resolve("@agentclientprotocol/codex-acp")],
      environment: codexRuntimeEnvironment(runtime.developerInstructions, environment),
    }),
  };
}

export const codexHarnessAdapter = createCodexHarnessAdapter();
