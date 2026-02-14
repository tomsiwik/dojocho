import { existsSync, lstatSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative } from "node:path";
import {
  CLI,
  DOJOS_DIR,
  readDojoRc,
  writeDojoRc,
  readDojoMd,
  readCatalog,
  resolveAllKatas,
  listDojos,
  loadConfig,
  type DojoRc,
} from "../config";
import { findCurrentKata, findNextKata, completedCount } from "../state";
import type { KataProgress } from "../config";

const USAGE = `Usage: ${CLI} <command> [flags]

Commands:
  (none)              Project-level actions (use flags below)
  kata                Kata-level actions (sensei, check, scaffold)
  add <source>        Add a dojo (training pack)
  remove <name>       Remove a dojo

Flags:
  --start             Initialize a new dojo project
  --test/--check      Show overall progress
  --list              List installed dojos
  --open              Print the active DOJO.md
  --change <dojo>     Switch active dojo`;

const ROOT_DOJO_MD = `# Welcome to Dojocho

Your dojo is set up and ready. You just need a dojo (training pack) to start practicing.

## Add a dojo

\`\`\`bash
dojo add <source>
\`\`\`

Source can be:
- A local path: \`dojo add ./path/to/dojo\`
- A git repo: \`dojo add org/repo\`
- Official dojos: \`dojo add effect-ts\`

## Start practicing

Once a dojo is added, use \`/kata\` in your coding agent to begin.
`;

const DOJO_CONFIG = `import { defineConfig } from "@dojocho/config"

export default defineConfig()
`;

const CLAUDE_SETTINGS = {
  permissions: {
    allow: [
      "Bash(dojo *)",
      "Bash(dojo)",
      "AskUserQuestion",
    ],
    deny: [
      "Read(.dojos/**)",
      "Glob(.dojos/**)",
      "Grep(.dojos/**)",
    ],
  },
};

const DEFAULT_KATA_MD = `!\`dojo kata\`
`;

const DEFAULT_RC: DojoRc = {
  currentDojo: "",
  currentKata: null,
  editor: "code",
  progress: {},
};

export function root(rootDir: string, args: string[]): void {
  const flag = args.find((a) => a.startsWith("--"));

  if (!flag) {
    console.log(USAGE);
    return;
  }

  switch (flag) {
    case "--start":
      start(rootDir);
      break;
    case "--check":
    case "--test":
      check(rootDir);
      break;
    case "--list":
      list(rootDir);
      break;
    case "--open":
      open(rootDir);
      break;
    case "--change": {
      const name = args[args.indexOf("--change") + 1];
      if (!name) throw new Error("Usage: dojo --change <dojo>");
      change(rootDir, name);
      break;
    }
    case "--help":
    case "-h":
      console.log(USAGE);
      break;
    default:
      throw new Error(`Unknown flag: ${flag}\n\n${USAGE}`);
  }
}

function start(root: string): void {
  const rcPath = resolve(root, ".dojorc");
  if (!existsSync(rcPath)) {
    writeDojoRc(root, DEFAULT_RC);
  }

  mkdirSync(resolve(root, DOJOS_DIR), { recursive: true });

  const dojoMdPath = resolve(root, DOJOS_DIR, "DOJO.md");
  if (!existsSync(dojoMdPath)) {
    writeFileSync(dojoMdPath, ROOT_DOJO_MD);
  }

  const configPath = resolve(root, "dojo.config.ts");
  if (!existsSync(configPath)) {
    writeFileSync(configPath, DOJO_CONFIG);
  }

  const tsconfigPath = resolve(root, "tsconfig.json");
  if (!existsSync(tsconfigPath)) {
    writeFileSync(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "ES2022",
            moduleResolution: "bundler",
            strict: true,
            noEmit: true,
          },
          include: ["katas/**/*.ts"],
        },
        null,
        2,
      ) + "\n",
    );
  }

  const pkgPath = resolve(root, "package.json");
  if (!existsSync(pkgPath)) {
    writeFileSync(
      pkgPath,
      JSON.stringify({ type: "module", private: true }, null, 2) + "\n",
    );
  }

  console.log("Installing @dojocho/config...");
  try {
    execSync("pnpm add @dojocho/config", { cwd: root, stdio: "pipe" });
  } catch {
    console.log(
      "  Could not install @dojocho/config from registry.\n" +
        "  If not yet published, link it manually:\n" +
        "    pnpm link <path-to-dojocho>/packages/config",
    );
  }

  const agentDirs = [".claude", ".opencode", ".codex"];
  for (const dir of agentDirs) {
    mkdirSync(resolve(root, dir, "commands"), { recursive: true });
    mkdirSync(resolve(root, dir, "skills"), { recursive: true });

    const kataMd = resolve(root, dir, "commands", "kata.md");
    try { if (lstatSync(kataMd).isSymbolicLink()) unlinkSync(kataMd); } catch {}
    if (!existsSync(kataMd)) {
      writeFileSync(kataMd, DEFAULT_KATA_MD);
    }

    if (dir === ".claude") {
      const settingsPath = resolve(root, dir, "settings.json");
      writeFileSync(settingsPath, JSON.stringify(CLAUDE_SETTINGS, null, 2) + "\n");
    }
  }

  console.log(`Dojo ready.

  Add a dojo with: dojo add <source>
  Then use:        /kata`);
}

function check(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    console.log(`No dojo active. Add one with:
  ${CLI} add <source>`);
    return;
  }

  const catalog = readCatalog(root, rc.currentDojo);
  const katas = resolveAllKatas(root, rc, catalog);
  const progress = rc.progress?.[rc.currentDojo];
  const current = findCurrentKata(katas, rc.currentKata);
  const completed = completedCount(katas, progress);
  const total = katas.length;

  if (!current) {
    const next = findNextKata(katas, progress);
    if (next) {
      console.log(`${completed}/${total} katas complete. No kata in progress.

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Start next kata" (Begin the next kata in sequence) → run: ${CLI} kata --start
- "Pick a kata" (Browse and choose a specific kata) → run: ${CLI} kata --list`);
    } else {
      console.log(`All ${total} katas complete. The dojo is finished.`);
    }
    return;
  }

  const workspaceRel = relative(root, current.workspacePath);

  console.log(`Kata: ${current.name} (in progress)
${completed}/${total} complete | Workspace: ${workspaceRel}

Invoke AskUserQuestion (or similar tool) to ask the student:
- "Check progress" → run: ${CLI} kata --check
- "Keep working" → encourage them
- "Switch kata" → run: ${CLI} kata --list`);
}

function list(root: string): void {
  const rc = readDojoRc(root);
  const dojos = listDojos(root);

  if (dojos.length === 0) {
    console.log(`No dojos installed. Add one with:
  ${CLI} add <source>`);
    return;
  }

  console.log("Dojos:\n");
  for (const name of dojos) {
    const marker = name === rc.currentDojo ? "[*]" : "[ ]";
    console.log(`  ${marker} ${name}`);
  }
}

function open(root: string): void {
  const rc = readDojoRc(root);
  const md = readDojoMd(root, rc.currentDojo);
  if (md) {
    console.log(md);
  } else {
    console.log("No DOJO.md found. Run `dojo --start` first.");
  }
}

function change(root: string, name: string): void {
  const dojos = listDojos(root);
  if (!dojos.includes(name)) {
    throw new Error(`Dojo "${name}" not found. Available: ${dojos.join(", ") || "(none)"}`);
  }

  const rc = readDojoRc(root);
  rc.currentDojo = name;
  rc.currentKata = null;
  writeDojoRc(root, rc);

  const dojoTsconfigPath = resolve(root, DOJOS_DIR, name, "tsconfig.json");
  if (existsSync(dojoTsconfigPath)) {
    const config = loadConfig(root);
    const katasInclude = `${relative(root, config.katasPath)}/**/*.ts`;
    const tsconfigPath = resolve(root, "tsconfig.json");
    const extendsPath = `./${relative(root, dojoTsconfigPath)}`;
    writeFileSync(
      tsconfigPath,
      JSON.stringify(
        {
          extends: extendsPath,
          compilerOptions: { noEmit: true },
          include: [katasInclude],
        },
        null,
        2,
      ) + "\n",
    );
  }

  console.log(`Switched to dojo "${name}".`);
}
