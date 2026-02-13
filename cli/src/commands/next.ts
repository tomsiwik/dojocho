import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import {
  CLI,
  readDojoRc,
  writeDojoRc,
  readCatalog,
  resolveAllKatas,
  ryuDir,
} from "../config.js";
import { findNextKata, findKataByIdOrName } from "../state.js";

export function next(root: string, args: string[]): void {
  const rc = readDojoRc(root);
  const catalog = readCatalog(root, rc.active);
  const katas = resolveAllKatas(root, rc, catalog);
  const ryu = ryuDir(root, rc.active);

  const approve = args.includes("--approve");
  const query = args.find((a) => !a.startsWith("--"));

  // Find target kata
  const target = query ? findKataByIdOrName(katas, query) : findNextKata(katas);

  if (!target) {
    if (query) {
      console.log(`Kata not found: ${query}`);
    } else {
      console.log("All katas are scaffolded. The dojo is complete.");
    }
    process.exit(1);
  }

  // Already scaffolded?
  if (existsSync(target.workspacePath)) {
    const workspaceRel = relative(root, target.workspacePath);
    console.log(`${target.name} is already scaffolded.
Workspace: ${workspaceRel}

Ask the student:
- "Check progress" (Run tests to see how you're doing) → run: ${CLI} check ${target.name}
- "Keep working" (Continue on your own) → encourage them`);
    return;
  }

  // Preview mode (no --approve)
  if (!approve) {
    const nearby = katas
      .filter((k) => !existsSync(k.workspacePath))
      .slice(0, 4)
      .map((k) => `  ${k.name}`)
      .join("\n");

    console.log(`Next kata: ${target.name}

Available:
${nearby}

Ask the student which kata to start, then run:
${CLI} next <name> --approve`);
    return;
  }

  // Scaffold
  const templateSrc = resolve(ryu, target.template);
  if (!existsSync(templateSrc)) {
    console.log(`Template not found: ${target.template}`);
    process.exit(1);
  }

  mkdirSync(dirname(target.workspacePath), { recursive: true });
  copyFileSync(templateSrc, target.workspacePath);

  // Update .dojorc
  rc.current = target.name;
  writeDojoRc(root, rc);

  const workspaceRel = relative(root, target.workspacePath);
  const senseiRel = relative(root, target.senseiPath);
  const absPath = target.workspacePath;

  let output = `Kata ${target.name} scaffolded.
Workspace: ${workspaceRel}`;

  if (rc.editor) {
    output += `\nOpen command: ${rc.editor} ${absPath}`;
  }

  output += `

Read SENSEI at ${senseiRel}. Present the briefing.

Ask the student:
- "Open the file" (Open solution in editor) → run: ${rc.editor ?? "code"} ${absPath}
- "I have questions" (Ask about the concepts before starting) → answer using SENSEI guidance`;

  console.log(output);
}
