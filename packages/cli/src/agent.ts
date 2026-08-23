import { runtimeIdentity } from "./runtime";

interface AgentRuntime {
  name: string;
  askTool: string;
}

const FALLBACK: AgentRuntime = { name: "unknown", askTool: "AskUserQuestion or similar tool" };
const ASK_TOOLS: Record<string, string> = {
  claude: "AskUserQuestion",
  opencode: "question",
  codex: "AskUserQuestion",
  gemini: "ask_user",
  pi: "AskUserQuestion",
};

export function detectRuntime(): AgentRuntime {
  const { name } = runtimeIdentity();
  return name === "unknown" ? FALLBACK : { name, askTool: ASK_TOOLS[name] };
}

export function askTool(): string {
  return detectRuntime().askTool;
}
