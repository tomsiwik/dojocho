import { existsSync, mkdirSync, lstatSync, unlinkSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { CLI, DOJOS_DIR, readDojoRc, writeDojoRc, type DojoRc } from "../config";
import { pmCommands } from "../pm";

export const AGENTS = {
  claude: { dir: ".claude", hasSettings: true },
  opencode: { dir: ".opencode", hasSettings: false },
  codex: { dir: ".codex", hasSettings: false },
  gemini: { dir: ".gemini", hasSettings: false },
} as const;

export type AgentName = keyof typeof AGENTS;

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

const DEFAULT_RC: DojoRc = {
  currentDojo: "",
  currentKata: null,
  editor: "code",
  progress: {},
};

export function setup(root: string, args: string[]): void {
  const explicit = (Object.keys(AGENTS) as AgentName[]).filter(
    (a) => args.includes(`--${a}`),
  );

  if (explicit.length === 0) {
    promptAgents();
    return;
  }

  scaffold(root);
  setupAgents(root, explicit);

  console.log(`Dojo ready.

  Add a dojo with: ${CLI} add <source>
  Then use:        /kata`);
}

function promptAgents(): void {
  const options = [
    `- "Claude Code" → --claude`,
    `- "OpenCode" → --opencode`,
    `- "Codex" → --codex`,
    `- "Gemini CLI" → --gemini`,
  ].join("\n");

  console.log(`Invoke AskUserQuestion (multiSelect) to ask the student:
Which coding agents do you use?
${options}

Then run: ${CLI} setup --<agent1> --<agent2> ...`);
}

function scaffold(root: string): void {
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

  const pm = pmCommands(root);
  console.log("Installing @dojocho/config...");
  execSync(pm.add("@dojocho/config"), { cwd: root, stdio: "pipe" });
}

export function setupAgents(root: string, agents: AgentName[]): void {
  for (const agent of agents) {
    const dir = AGENTS[agent].dir;
    mkdirSync(resolve(root, dir, "commands"), { recursive: true });
    mkdirSync(resolve(root, dir, "skills"), { recursive: true });

    const kataMd = resolve(root, dir, "commands", "kata.md");
    try { if (lstatSync(kataMd).isSymbolicLink()) unlinkSync(kataMd); } catch {}
    if (!existsSync(kataMd)) {
      writeFileSync(kataMd, DEFAULT_KATA_MD);
    }

    if (AGENTS[agent].hasSettings) {
      const settingsPath = resolve(root, dir, "settings.json");
      writeFileSync(settingsPath, JSON.stringify(CLAUDE_SETTINGS, null, 2) + "\n");
    }
  }
}

export function configuredAgents(root: string): AgentName[] {
  return (Object.keys(AGENTS) as AgentName[]).filter(
    (a) => existsSync(resolve(root, AGENTS[a].dir)),
  );
}
