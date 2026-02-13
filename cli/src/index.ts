import { findProjectRoot } from "./config.js";
import { setup } from "./commands/setup.js";
import { status } from "./commands/status.js";
import { next } from "./commands/next.js";
import { check } from "./commands/check.js";

const USAGE = `Usage: dojo <command>

Commands:
  setup    Bootstrap the dojo (deps, symlinks)
  status   Show current kata state
  next     Preview or scaffold next kata
  check    Run tests for current kata`;

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  console.log(USAGE);
  process.exit(0);
}

try {
  const root = findProjectRoot();

  switch (command) {
    case "setup":
      setup(root);
      break;
    case "status":
      status(root);
      break;
    case "next":
      next(root, args);
      break;
    case "check":
      check(root, args);
      break;
    default:
      console.log(`Unknown command: ${command}\n\n${USAGE}`);
      process.exit(1);
  }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
