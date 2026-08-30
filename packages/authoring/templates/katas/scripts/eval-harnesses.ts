import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LessonEvalHarness } from "./eval-types";

type OpenCodeEvent = {
  type?: string;
  part?: { type?: string; text?: string };
};

export function createHarness(name: string, root: string): LessonEvalHarness {
  if (name === "cassette") {
    return {
      name,
      generate: async ({ scenario }) => {
        if (scenario.fixture === undefined) {
          throw new Error(`Scenario ${scenario.id} has no cassette fixture`);
        }
        return scenario.fixture;
      },
    };
  }
  if (name !== "opencode") throw new Error(`Unknown eval harness: ${name}`);
  return {
    name,
    generate: ({ course, lesson, scenario }) => runOpenCode({
      root,
      instructions: [course, lesson].join("\n\n"),
      prompt: scenario.prompt,
    }),
  };
}

async function runOpenCode(input: {
  root: string;
  instructions: string;
  prompt: string;
}): Promise<string> {
  const config = {
    default_agent: "kyoshi-eval",
    agent: {
      "kyoshi-eval": {
        mode: "primary",
        description: "Evaluate one authored Dojofoo lesson.",
        prompt: input.instructions,
        permission: {
          bash: "deny",
          edit: "deny",
          external_directory: "deny",
          glob: "deny",
          grep: "deny",
          list: "deny",
          read: "deny",
        },
      },
    },
  };
  const command = process.env.OPENCODE_BIN
    ?? join(homedir(), ".opencode", "bin", "opencode");
  const child = spawn(command, [
    "run",
    "--format",
    "json",
    "--pure",
    "--auto",
    "--dir",
    input.root,
    "--agent",
    "kyoshi-eval",
    ...(process.env.DOJOFOO_EVAL_MODEL
      ? ["--model", process.env.DOJOFOO_EVAL_MODEL]
      : []),
    input.prompt,
  ], {
    env: { ...process.env, OPENCODE_CONFIG_CONTENT: JSON.stringify(config) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => { stdout += chunk; });
  child.stderr.on("data", (chunk: string) => { stderr += chunk; });
  const exitCode = await new Promise<number | null>((done, reject) => {
    const timeout = setTimeout(() => child.kill("SIGTERM"), 90_000);
    child.once("error", reject);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      done(code);
    });
  });
  if (exitCode !== 0) {
    throw new Error(`OpenCode eval exited with ${exitCode ?? "no status"}: ${stderr}`);
  }
  return stdout
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as OpenCodeEvent)
    .filter((event) => event.type === "text" && event.part?.text)
    .map((event) => event.part?.text ?? "")
    .join("")
    .trim();
}
