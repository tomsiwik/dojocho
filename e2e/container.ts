import { spawnSync, execSync } from "node:child_process";

const CONTAINER = "dojocho-e2e";
const DEFAULT_TIMEOUT_MS = 110_000;

function ensureRunning(): void {
  try {
    const state = execSync(
      `docker inspect -f '{{.State.Running}}' ${CONTAINER} 2>/dev/null`,
      { encoding: "utf8" },
    ).trim();
    if (state === "true") return;
  } catch {}
  throw new Error(`E2E container "${CONTAINER}" not running. Run \`pnpm e2e:up\` first.`);
}

export function execScript(
  script: string,
  opts: { timeoutMs?: number } = {},
): { output: string; exitCode: number; timedOut: boolean } {
  ensureRunning();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const r = spawnSync(
    "docker",
    ["exec", CONTAINER, "bash", "-eo", "pipefail", "-c", script],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: timeoutMs, killSignal: "SIGKILL" },
  );
  const timedOut = r.signal === "SIGKILL" || (r as { error?: { code?: string } }).error?.code === "ETIMEDOUT";
  return {
    output: `${r.stdout ?? ""}${r.stderr ?? ""}${timedOut ? `\n[timed out after ${timeoutMs}ms]` : ""}`,
    exitCode: timedOut ? 124 : (r.status ?? -1),
    timedOut,
  };
}
