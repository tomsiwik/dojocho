import { findProjectRoot } from "./config";
import { observeLocalContext, sessionFromEnvironment } from "@dojofoo/config/local-state";
import { prepareWorkspace } from "@dojofoo/config/project-preparation";
import { root } from "./commands/root";
import { kata } from "./commands/kata";
import { intro } from "./commands/intro";
import { setup } from "./commands/setup";
import { add } from "./commands/add";
import { remove } from "./commands/remove";
import { status } from "./commands/status";
import { ui } from "./commands/ui";
import { track } from "./commands/track";
import { update } from "./commands/update";
import { flushCourseEvents } from "./telemetry";
import { bootstrapMise } from "./mise-bootstrap";

const [command, ...args] = process.argv.slice(2);

process.env.DOJO_PROJECT_ROOT ??= findProjectRoot();

async function main() {
  const projectRoot = process.env.DOJO_PROJECT_ROOT!;
  const isUiControlCommand = command === "ui" && ["prompt", "--skill"].includes(args[0] ?? "");
  const isSetupCommand = command === "install" || command === "setup";
  if (
    !process.env.DOJO_SKIP_PREPARE
    && command
    && !isUiControlCommand
    && !["--help", "-h", "install", "setup", "add", "remove", "update"].includes(command)
  ) {
    await prepareWorkspace(projectRoot);
  }
  if (!(isUiControlCommand || isSetupCommand)) {
    observeLocalContext(projectRoot, {
      session: sessionFromEnvironment(),
    });
  }
  if (command === "kata") {
    kata(findProjectRoot(), args);
  } else if (command === "intro") {
    intro(findProjectRoot(), args);
  } else if (command === "install" || command === "setup") {
    if (!args.includes("--skills")) await bootstrapMise();
    setup(process.cwd(), args);
  } else if (command === "add") {
    await add(process.cwd(), args);
  } else if (command === "remove") {
    remove(findProjectRoot(), args);
  } else if (command === "update") {
    await update(findProjectRoot(), args);
  } else if (command === "status") {
    status(findProjectRoot(), args);
  } else if (command === "ui") {
    process.env.PORT ??= process.env.DOJO_UI_PORT ?? "4567";
    await ui(findProjectRoot(), args);
  } else if (command === "track") {
    track(findProjectRoot(), args);
  } else {
    // Everything else is root-level flags
    root(process.cwd(), [command, ...args].filter(Boolean));
  }
  if (!isUiControlCommand) await flushCourseEvents();
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
