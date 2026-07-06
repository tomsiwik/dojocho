import { readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { CLI } from "../config";
import { cassetteDir, recordCassette, relativeCassettePath } from "../tracking";

const USAGE = `Usage: ${CLI} track [flags]

Flags:
  (none)              Record the active coding-agent session as a cassette
  --source <path>     Record a specific session log
  --list              List recorded cassettes`;

export function track(root: string, args: string[]): void {
  const flag = args.find((a) => a.startsWith("--"));

  if (flag === "--help" || flag === "-h") {
    console.log(USAGE);
    return;
  }

  if (flag === "--list") {
    list(root);
    return;
  }

  if (flag && flag !== "--source") {
    throw new Error(`Unknown flag: ${flag}\n\n${USAGE}`);
  }

  const result = recordCassette(root, args);
  console.log(`Recorded ${result.entries} entries from ${result.agent} session ${result.sessionId}.`);
  console.log(`Cassette: ${relativeCassettePath(root, result.outputPath)}`);
  console.log("Submission is voluntary; review the cassette before sharing it to improve courses.");
}

function list(root: string): void {
  const dir = cassetteDir(root);
  if (!existsSync(dir)) {
    console.log("No cassettes recorded yet.");
    return;
  }

  const files = readdirSync(dir).filter((name) => name.endsWith(".jsonl")).sort();
  if (files.length === 0) {
    console.log("No cassettes recorded yet.");
    return;
  }

  console.log("Cassettes:\n");
  for (const file of files) {
    console.log(`  ${relativeCassettePath(root, resolve(dir, file))}`);
  }
}
