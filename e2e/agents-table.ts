import { AGENTS, type AgentName } from "../packages/cli/src/commands/setup";

const MODEL = "gpt-oss-120b";
const GEMINI_MODEL = "gemini-2.5-flash";

export interface AgentRow {
  agent: AgentName;
  envVars: readonly string[];
  dir: string;
  commandsDir: string;
  hasSettings: boolean;
  headless(prompt: string): string;
}

export const AGENTS_TABLE: readonly AgentRow[] = (Object.keys(AGENTS) as AgentName[])
  .map((agent): AgentRow => {
    const cfg = AGENTS[agent];
    return {
      agent,
      envVars: cfg.envVars,
      dir: cfg.dir,
      commandsDir: cfg.commandsDir,
      hasSettings: cfg.hasSettings,
      headless(prompt: string): string {
        const q = JSON.stringify(prompt);
        switch (agent) {
          case "claude":
            throw new Error("claude is not in scope for the e2e bootstrap suite");
          case "opencode":
            return `opencode run ${q}`;
          case "codex":
            return `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox ${q} < /dev/null`;
          case "gemini":
            return `gemini -p ${q} --yolo --skip-trust --model "${GEMINI_MODEL}"`;
          case "pi":
            return `pi --provider cerebras --model "cerebras/${MODEL}" --thinking low --no-skills --no-extensions --no-context-files --no-prompt-templates -p ${q}`;
        }
      },
    };
  });
