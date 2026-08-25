import { spawn } from "node:child_process";

const models = (process.env.DOJOFOO_EVAL_MODELS ?? [
  "opencode/big-pickle",
  "opencode/mimo-v2.5-free",
  "opencode/nemotron-3.5-lightning-free",
].join(",")).split(",").map((model) => model.trim()).filter(Boolean);
const stages = (process.env.DOJOFOO_EVAL_STAGES ?? "start,novice,stuck,review")
  .split(",").map((stage) => stage.trim()).filter(Boolean);

let failed = false;
for (const model of models) {
  for (const stage of stages) {
    const code = await run("pnpm", ["eval:lifecycle"], {
      DOJOFOO_EVAL_MODEL: model,
      DOJOFOO_EVAL_STAGE: stage,
    });
    if (code !== 0) failed = true;
  }
  const code = await run("pnpm", ["eval:transformation"], { DOJOFOO_EVAL_MODEL: model });
  if (code !== 0) failed = true;
}

if (failed) process.exitCode = 1;

function run(command: string, args: string[], environment: Record<string, string>): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: import.meta.dirname.replace(/\/src$/u, ""),
      env: { ...process.env, ...environment },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", resolve);
  });
}
