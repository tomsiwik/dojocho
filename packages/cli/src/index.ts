import { findProjectRoot } from "./config";
import { root } from "./commands/root";
import { kata } from "./commands/kata";
import { add } from "./commands/add";
import { remove } from "./commands/remove";

const [command, ...args] = process.argv.slice(2);

async function main() {
  if (command === "kata") {
    kata(findProjectRoot(), args);
  } else if (command === "add") {
    await add(process.cwd(), args);
  } else if (command === "remove") {
    remove(findProjectRoot(), args);
  } else {
    // Everything else is root-level flags
    root(process.cwd(), [command, ...args].filter(Boolean));
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
