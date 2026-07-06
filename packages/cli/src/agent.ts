interface AgentRuntime {
  name: string;
  askTool: string;
}

const RUNTIMES: { envVar: string; runtime: AgentRuntime }[] = [
  { envVar: "CLAUDECODE", runtime: { name: "claude", askTool: "AskUserQuestion" } },
  { envVar: "OPENCODE", runtime: { name: "opencode", askTool: "question" } },
  { envVar: "CODEX_THREAD_ID", runtime: { name: "codex", askTool: "AskUserQuestion" } },
  { envVar: "GEMINI_CLI", runtime: { name: "gemini", askTool: "ask_user" } },
  { envVar: "PI_CODING_AGENT", runtime: { name: "pi", askTool: "AskUserQuestion" } },
];

const FALLBACK: AgentRuntime = { name: "unknown", askTool: "AskUserQuestion or similar tool" };

export function detectRuntime(): AgentRuntime {
  for (const { envVar, runtime } of RUNTIMES) {
    if (process.env[envVar]) return runtime;
  }
  return FALLBACK;
}

export function askTool(): string {
  return detectRuntime().askTool;
}
