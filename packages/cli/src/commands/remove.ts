import { existsSync, rmSync, readdirSync, lstatSync, readlinkSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import {
  DOJOS_DIR,
  readDojoRc,
  writeDojoRc,
} from "../config";

export function remove(root: string, args: string[]): void {
  const name = args.find((a) => !a.startsWith("--"));
  if (!name) {
    console.log("Usage: dojo remove <name>");
    process.exit(1);
  }

  const ryuPath = resolve(root, DOJOS_DIR, name);
  if (!existsSync(ryuPath)) {
    console.log(`Ryu "${name}" not found at ${DOJOS_DIR}/${name}`);
    process.exit(1);
  }

  // Remove the ryu directory
  rmSync(ryuPath, { recursive: true, force: true });

  // Clean symlinks in agent directories that pointed into the removed ryu
  const agentDirs = [".claude", ".opencode", ".codex"];
  for (const dir of agentDirs) {
    for (const sub of ["commands", "skills"]) {
      const subDir = resolve(root, dir, sub);
      if (!existsSync(subDir)) continue;
      for (const entry of readdirSync(subDir)) {
        const link = resolve(subDir, entry);
        try {
          if (!lstatSync(link).isSymbolicLink()) continue;
          const target = readlinkSync(link);
          if (target.includes(`${DOJOS_DIR}/${name}/`) || target.includes(`${DOJOS_DIR}/${name}\\`)) {
            unlinkSync(link);
          }
        } catch {
          // skip
        }
      }
    }
  }

  // Clear .dojorc if this was the active ryu
  try {
    const rc = readDojoRc(root);
    if (rc.currentRyu === name) {
      rc.currentRyu = "";
      rc.currentKata = null;
      writeDojoRc(root, rc);
    }
  } catch {
    // .dojorc may not exist
  }

  console.log(`Ryu "${name}" removed.`);
}
