import { relative } from "node:path";
import {
  CLI,
  readDojoRc,
  readCatalog,
  resolveAllKatas,
} from "../config.js";
import {
  findCurrentKata,
  findNextKata,
  completedCount,
} from "../state.js";

export function status(root: string): void {
  const rc = readDojoRc(root);
  const catalog = readCatalog(root, rc.active);
  const katas = resolveAllKatas(root, rc, catalog);
  const current = findCurrentKata(katas, rc.current);
  const completed = completedCount(katas, rc.current);
  const total = katas.length;

  if (!current) {
    const next = findNextKata(katas);
    if (next) {
      console.log(`${completed}/${total} katas complete. No kata in progress.

Ask the student:
- "Start next kata" → run: ${CLI} next --approve
- "Pick a kata" → run: ${CLI} next`);
    } else {
      console.log(`All ${total} katas complete. The dojo is finished.`);
    }
    return;
  }

  const workspaceRel = relative(root, current.workspacePath);

  console.log(`Kata: ${current.name} (in progress)
${completed}/${total} complete | Workspace: ${workspaceRel}

Ask the student:
- "Check progress" → run: ${CLI} check
- "Keep working" → encourage them
- "Switch kata" → run: ${CLI} next`);
}
