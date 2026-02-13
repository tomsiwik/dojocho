import { existsSync, mkdirSync, symlinkSync, readdirSync, readlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative } from "node:path";
import {
  readDojoRc,
  writeDojoRc,
  ryuDir,
  type DojoRc,
} from "../config.js";

const DEFAULT_RC: DojoRc = {
  active: "effect-ts",
  current: null,
  editor: "code",
  allowCommit: false,
  tracking: {
    enabled: false,
    pushOnComplete: false,
    remote: "origin",
  },
};

export function setup(root: string): void {
  // 1. Create .dojorc if missing
  const rcPath = resolve(root, ".dojorc");
  if (!existsSync(rcPath)) {
    writeDojoRc(root, DEFAULT_RC);
  }
  const rc = readDojoRc(root);
  const ryu = ryuDir(root, rc.active);

  // 2. Symlink commands and skills to agent directories
  const agentDirs = [".claude", ".opencode", ".codex"];
  for (const dir of agentDirs) {
    mkdirSync(resolve(root, dir, "commands"), { recursive: true });
    mkdirSync(resolve(root, dir, "skills"), { recursive: true });

    // Symlink commands
    const cmdsDir = resolve(ryu, "commands");
    if (existsSync(cmdsDir)) {
      for (const file of readdirSync(cmdsDir)) {
        if (!file.endsWith(".md")) continue;
        const link = resolve(root, dir, "commands", file);
        const target = relative(
          resolve(root, dir, "commands"),
          resolve(cmdsDir, file),
        );
        if (!existsSync(link)) {
          symlinkSync(target, link);
        }
      }
    }

    // Symlink skills
    const skillsDir = resolve(ryu, "skills");
    if (existsSync(skillsDir)) {
      for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const link = resolve(root, dir, "skills", entry.name);
        const target = relative(
          resolve(root, dir, "skills"),
          resolve(skillsDir, entry.name),
        );
        if (!existsSync(link)) {
          symlinkSync(target, link);
        }
      }
    }
  }

  // 3. Install ryu dependencies
  if (!existsSync(resolve(ryu, "node_modules"))) {
    execSync("pnpm install --silent", { cwd: ryu, stdio: "pipe" });
  }

  // 4. Root node_modules symlink (for editor resolution)
  const rootModules = resolve(root, "node_modules");
  if (!existsSync(rootModules)) {
    const target = relative(root, resolve(ryu, "node_modules"));
    symlinkSync(target, rootModules);
  }

  // Output
  console.log(`Dojo ready.

  Ryu:       ${rc.active}
  Command:   /kata`);
}
