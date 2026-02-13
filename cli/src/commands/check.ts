import { relative } from "node:path";
import {
  CLI,
  readDojoRc,
  readCatalog,
  resolveAllKatas,
  ryuDir,
} from "../config.js";
import { findCurrentKata, findNextKata, findKataByIdOrName } from "../state.js";
import { runTests } from "../runner.js";

export function check(root: string, args: string[]): void {
  const rc = readDojoRc(root);
  const catalog = readCatalog(root, rc.active);
  const katas = resolveAllKatas(root, rc, catalog);
  const ryu = ryuDir(root, rc.active);

  const query = args.find((a) => !a.startsWith("--"));
  let target = query
    ? findKataByIdOrName(katas, query)
    : findCurrentKata(katas, rc.current);

  if (!target) {
    const next = findNextKata(katas);
    if (next) {
      console.log(`No kata in progress.

Ask the student:
- "Start next kata" (Prepare the next one in order) → run: ${CLI} next --approve
- "Pick a kata" (Browse available katas) → run: ${CLI} next`);
    } else {
      console.log(`All ${katas.length} katas complete. The dojo is finished.`);
    }
    return;
  }

  const result = runTests(target, catalog, ryu);
  const senseiRel = relative(root, target.senseiPath);
  const workspaceRel = relative(root, target.workspacePath);

  if (result.error) {
    console.log(`${target.name}: error

${result.error}

Ask the student:
- "Help me fix this" (Get guidance on the error) → read ${senseiRel}
- "Keep working" (Try to fix it yourself) → no action`);
    process.exit(1);
  }

  const passing = result.tests.filter((t) => t.status === "passed");
  const failing = result.tests.filter((t) => t.status === "failed");
  const lines = result.tests.map(
    (t) => `  [${t.status === "passed" ? "x" : " "}] ${t.title}`,
  );

  if (result.passed === result.total && result.total > 0) {
    console.log(`${target.name}: ${result.total}/${result.total} — complete!

${lines.join("\n")}

Ask the student:
- "Review" (Get feedback on idiomatic patterns and potential improvements) → read ${workspaceRel} and ${senseiRel}, suggest improvements (Socratic only)
- "Move on" (Wrap up with key insight, then start next kata) → read ${senseiRel}, follow On Completion (insight + bridge), then run: ${CLI} next --approve
- "Pause" (Take a break, come back anytime) → give a friendly sign-off and remind them to run /kata when ready to continue`);
    return;
  }

  console.log(`${target.name}: ${result.passed}/${result.total} passing

${lines.join("\n")}

Ask the student:
- "Help me" (Get hints based on failing tests) → read ${senseiRel}, use the Test Map
- "Keep working" (Continue on your own) → encourage them
- "Pause" (Take a break, come back anytime) → give a friendly sign-off and remind them to run /kata when ready to continue`);
}
