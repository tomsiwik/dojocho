import { existsSync, readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, resolve, relative } from "node:path";
import {
  CLI,
  readDojoRc,
  writeDojoRc,
  readCatalog,
  readDojoMd,
  resolveAllKatas,
  ryuDir,
} from "../config";
import {
  findCurrentKata,
  findNextKata,
  findKataByIdOrName,
  kataState,
  completedCount,
} from "../state";
import { runTests } from "../runner";

const USAGE = `Usage: ${CLI} kata [flags]

Flags:
  (none)              Show SENSEI.md for current kata (smart fallback)
  --start             Scaffold next kata
  --test/--check      Run tests for current kata
  --list              List all katas with state
  --change <name>     Switch to a specific kata + scaffold
  --open              Open kata in editor`;

export function kata(root: string, args: string[]): void {
  const flag = args.find((a) => a.startsWith("--"));

  if (!flag) {
    smart(root, args);
    return;
  }

  switch (flag) {
    case "--start":
      start(root);
      break;
    case "--check":
    case "--test":
      check(root, args);
      break;
    case "--list":
      list(root);
      break;
    case "--change": {
      const name = args[args.indexOf("--change") + 1];
      if (!name) {
        console.log("Usage: dojo kata --change <name>");
        process.exit(1);
      }
      change(root, name);
      break;
    }
    case "--open":
      open(root);
      break;
    case "--help":
    case "-h":
      console.log(USAGE);
      break;
    default:
      console.log(`Unknown flag: ${flag}\n\n${USAGE}`);
      process.exit(1);
  }
}

function smart(root: string, args: string[]): void {
  const rc = readDojoRc(root);

  // No ryu → root DOJO.md
  if (!rc.currentRyu) {
    const md = readDojoMd(root, "");
    if (md) {
      console.log(md);
    } else {
      console.log(`No ryu active. Add one with:
  ${CLI} add <source>`);
    }
    return;
  }

  let catalog;
  try {
    catalog = readCatalog(root, rc.currentRyu);
  } catch {
    // No katas in ryu → ryu's DOJO.md
    const md = readDojoMd(root, rc.currentRyu);
    if (md) {
      console.log(md);
    } else {
      console.log(`Ryu "${rc.currentRyu}" has no katas.json or DOJO.md.`);
    }
    return;
  }

  const katas = resolveAllKatas(root, rc, catalog);

  // Try query arg (positional, e.g. `dojo kata 005`)
  const query = args.find((a) => !a.startsWith("--"));
  const target = query
    ? findKataByIdOrName(katas, query)
    : findCurrentKata(katas, rc.currentKata);

  if (target) {
    // Show SENSEI.md
    if (existsSync(target.senseiPath)) {
      console.log(readFileSync(target.senseiPath, "utf8"));
    } else {
      console.log(`No SENSEI.md found for ${target.name}.`);
    }
    return;
  }

  // No kata active — ask the student what to do
  const next = findNextKata(katas);
  if (next) {
    console.log(`No kata in progress.

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Start next kata" (Begin the next kata in sequence) → run: ${CLI} kata --start
- "Pick a kata" (Browse and choose a specific kata) → run: ${CLI} kata --list`);
  } else {
    // All done → DOJO.md
    const md = readDojoMd(root, rc.currentRyu);
    if (md) console.log(md);
    else console.log("All katas complete. The dojo is finished.");
  }
}

function start(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentRyu) {
    console.log(`No ryu active. Add one with:
  ${CLI} add <source>`);
    return;
  }

  const catalog = readCatalog(root, rc.currentRyu);
  const katas = resolveAllKatas(root, rc, catalog);
  const ryu = ryuDir(root, rc.currentRyu);

  const target = findNextKata(katas);
  if (!target) {
    console.log("All katas are scaffolded. The dojo is complete.");
    return;
  }

  scaffold(root, rc, ryu, target);
}

function check(root: string, args: string[]): void {
  const rc = readDojoRc(root);

  if (!rc.currentRyu) {
    console.log(`No ryu active. Add one with:
  ${CLI} add <source>`);
    return;
  }

  const catalog = readCatalog(root, rc.currentRyu);
  const katas = resolveAllKatas(root, rc, catalog);
  const ryu = ryuDir(root, rc.currentRyu);

  const query = args.find((a) => !a.startsWith("--"));
  const target = query
    ? findKataByIdOrName(katas, query)
    : findCurrentKata(katas, rc.currentKata);

  if (!target) {
    const next = findNextKata(katas);
    if (next) {
      console.log(`No kata in progress.

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Start next kata" (Begin the next kata in sequence) → run: ${CLI} kata --start
- "Pick a kata" (Browse and choose a specific kata) → run: ${CLI} kata --list`);
    } else {
      console.log(`All ${katas.length} katas complete. The dojo is finished.`);
    }
    return;
  }

  const result = runTests(target, catalog, ryu);
  const workspaceRel = relative(root, target.workspacePath);

  if (result.error) {
    console.log(`${target.name}: error

${result.error}

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Help me fix this" → run: ${CLI} kata, then guide
- "Keep working" → no action`);
    process.exit(1);
  }

  const lines = result.tests.map(
    (t) => `  [${t.status === "passed" ? "x" : " "}] ${t.title}`,
  );

  if (result.passed === result.total && result.total > 0) {
    console.log(`${target.name}: ${result.total}/${result.total} — complete!

${lines.join("\n")}

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Review" (Get feedback on idiomatic patterns and potential improvements) → read ${workspaceRel} and run: ${CLI} kata, suggest improvements (Socratic only)
- "Move on" (Wrap up with key insight, then start next kata) → run: ${CLI} kata, follow On Completion (insight + bridge), then run: ${CLI} kata --start
- "Pause" (Take a break, come back anytime) → give a friendly sign-off and remind them to run /kata when ready to continue`);
    return;
  }

  console.log(`${target.name}: ${result.passed}/${result.total} passing

${lines.join("\n")}

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Help me" (Get hints based on failing tests) → run: ${CLI} kata, use the Test Map
- "Keep working" (Continue on your own) → encourage them
- "Pause" (Take a break, come back anytime) → give a friendly sign-off and remind them to run /kata when ready to continue`);
}

function list(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentRyu) {
    console.log(`No ryu active. Add one with:
  ${CLI} add <source>`);
    return;
  }

  const catalog = readCatalog(root, rc.currentRyu);
  const katas = resolveAllKatas(root, rc, catalog);
  const completed = completedCount(katas, rc.currentKata);

  console.log(`Katas (${completed}/${katas.length} complete):\n`);
  for (const k of katas) {
    const state = kataState(k);
    let marker: string;
    if (k.name === rc.currentKata && state === "ongoing") {
      marker = "[~]";
    } else if (state === "ongoing") {
      marker = "[x]";
    } else {
      marker = "[ ]";
    }
    console.log(`  ${marker} ${k.name}`);
  }
}

function change(root: string, name: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentRyu) {
    console.log(`No ryu active. Add one with:
  ${CLI} add <source>`);
    return;
  }

  const catalog = readCatalog(root, rc.currentRyu);
  const katas = resolveAllKatas(root, rc, catalog);
  const ryu = ryuDir(root, rc.currentRyu);

  const target = findKataByIdOrName(katas, name);
  if (!target) {
    console.log(`Kata not found: ${name}`);
    process.exit(1);
  }

  // Already scaffolded? Just switch to it.
  if (existsSync(target.workspacePath)) {
    rc.currentKata = target.name;
    writeDojoRc(root, rc);
    const workspaceRel = relative(root, target.workspacePath);
    console.log(`Switched to ${target.name}.
Workspace: ${workspaceRel}

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Check progress" → run: ${CLI} kata --check
- "Keep working" → encourage them`);
    return;
  }

  scaffold(root, rc, ryu, target);
}

function open(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentKata || !rc.currentRyu) {
    console.log("No kata in progress.");
    return;
  }

  const catalog = readCatalog(root, rc.currentRyu);
  const katas = resolveAllKatas(root, rc, catalog);
  const target = findCurrentKata(katas, rc.currentKata);

  if (!target) {
    console.log("No kata in progress.");
    return;
  }

  const editor = rc.editor ?? "code";
  const absPath = target.workspacePath;
  console.log(`Opening ${target.name}...`);
  try {
    execSync(`${editor} ${absPath}`, { stdio: "inherit" });
  } catch {
    console.log(`Could not open with "${editor}". File: ${absPath}`);
  }
}

function scaffold(
  root: string,
  rc: import("../config").DojoRc,
  ryu: string,
  target: import("../config").ResolvedKata,
): void {
  const templateSrc = resolve(ryu, target.template);
  if (!existsSync(templateSrc)) {
    console.log(`Template not found: ${target.template}`);
    process.exit(1);
  }

  mkdirSync(dirname(target.workspacePath), { recursive: true });
  copyFileSync(templateSrc, target.workspacePath);

  rc.currentKata = target.name;
  writeDojoRc(root, rc);

  const workspaceRel = relative(root, target.workspacePath);
  const absPath = target.workspacePath;

  let output = `Kata ${target.name} scaffolded.
Workspace: ${workspaceRel}`;

  if (rc.editor) {
    output += `\nOpen command: ${rc.editor} ${absPath}`;
  }

  output += `

run: ${CLI} kata
Present the briefing from SENSEI.

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Open the file" → run: ${CLI} kata --open
- "I have questions" → answer using SENSEI guidance`;

  console.log(output);
}
