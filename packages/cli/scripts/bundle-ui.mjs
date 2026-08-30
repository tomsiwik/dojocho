import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(packageRoot, "../../packages/ui/.output");
const destination = resolve(packageRoot, "dist/ui");
const templateSource = resolve(packageRoot, "../../packages/authoring/templates");
const templateDestination = resolve(packageRoot, "dist/templates");

if (!existsSync(resolve(source, "server/index.mjs"))) {
  throw new Error("The production dojo UI is missing. Run the workspace build before packaging dojofoo.");
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
rmSync(templateDestination, { recursive: true, force: true });
cpSync(templateSource, templateDestination, {
  recursive: true,
  filter: (path) => !path.includes("node_modules")
    && !path.endsWith("/.dojo")
    && !path.includes("/.dojo/"),
});
