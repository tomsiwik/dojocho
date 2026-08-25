import { spawn } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { introductionScenario, printResult } from "./introduction-scenario";

interface OpenCodeEvent {
  type?: string;
  part?: {
    type?: string;
    text?: string;
    tool?: string;
    toolName?: string;
    name?: string;
  };
}

const scenario = await introductionScenario();
const variants = [
  { id: "lesson", instructions: scenario.lesson, skill: false },
  { id: "lesson+skill", instructions: scenario.lesson, skill: true },
  { id: "platform+lesson+skill", instructions: [scenario.platform, scenario.lesson].join("\n\n"), skill: true },
  { id: "course+lesson+skill", instructions: [scenario.course, scenario.lesson].join("\n\n"), skill: true },
  { id: "full", instructions: scenario.instructions, skill: true },
] as const;
const requestedVariant = process.env.DOJOFOO_EVAL_VARIANT;
const selectedVariants = requestedVariant ? variants.filter((variant) => variant.id === requestedVariant) : variants;
if (selectedVariants.length === 0) throw new Error(`Unknown eval variant: ${requestedVariant}`);

for (const variant of selectedVariants) {
  await runVariant(variant);
}

async function runVariant(variant: (typeof variants)[number]): Promise<void> {
  const startedAt = Date.now();
  const root = await mkdtemp(join(tmpdir(), "dojofoo-eval-"));
  try {
  const skillDirectory = join(root, ".opencode/skills/dojofoo");
  const callsFile = join(root, "tool-calls.jsonl");
  await writeFile(join(root, "solution.ts"), scenario.solution);
  await writeFile(callsFile, "");
  if (variant.skill) {
    await mkdir(skillDirectory, { recursive: true });
    await writeFile(join(skillDirectory, "SKILL.md"), scenario.skill);
    await chmod(join(skillDirectory, "SKILL.md"), 0o600);
  }

  const config = {
    default_agent: "dojofoo-eval",
    agent: {
      "dojofoo-eval": {
        mode: "primary",
        description: "Evaluate the Dojofoo teaching contract.",
        prompt: variant.instructions,
        permission: {
          read: "allow",
          glob: "allow",
          grep: "allow",
          list: "allow",
          skill: "allow",
          bash: "deny",
          edit: "deny",
          external_directory: "deny",
        },
      },
    },
    mcp: {
      dojofoo: {
        type: "local",
        command: [join(import.meta.dirname, "../node_modules/.bin/tsx"), join(import.meta.dirname, "eval-mcp.ts")],
        enabled: true,
        environment: { DOJOFOO_EVAL_CALLS: callsFile },
      },
    },
  };
  const command = process.env.OPENCODE_BIN ?? join(process.env.HOME ?? "", ".opencode/bin/opencode");
  const args = [
    "run", "--format", "json", "--pure", "--auto", "--dir", root,
    "--agent", "dojofoo-eval",
    ...(process.env.DOJOFOO_EVAL_MODEL ? ["--model", process.env.DOJOFOO_EVAL_MODEL] : []),
    scenario.prompt,
  ];
  const child = spawn(command, args, {
    env: { ...process.env, OPENCODE_CONFIG_CONTENT: JSON.stringify(config) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  let output = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => { output += chunk; });
  const exitCode = await new Promise<number | null>((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", resolveExit);
  });
  if (exitCode !== 0) throw new Error(`OpenCode exited with status ${exitCode ?? "unknown"}`);

  const events = output.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as OpenCodeEvent);
  const text = events
    .filter((event) => event.type === "text" && typeof event.part?.text === "string")
    .map((event) => event.part!.text)
    .join("")
    .trim();
  const calls = (await readFile(callsFile, "utf8"))
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { name: string });
  const nativeToolNames = events.flatMap((event) => {
    if (event.part?.type !== "tool") return [];
    const name = event.part.tool ?? event.part.toolName ?? event.part.name;
    return name ? [name] : [];
  });
  const toolNames = [...new Set([...nativeToolNames, ...calls.map((call) => call.name)])];
  printResult(`opencode-local:${variant.id}`, text, toolNames, Date.now() - startedAt);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
