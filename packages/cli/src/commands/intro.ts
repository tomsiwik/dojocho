import { CLI, readDojoRc, writeDojoRc, readDojoMd, listDojos } from "../config";

export function intro(root: string, _args: string[]): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    const md = readDojoMd(root, "");
    if (md) console.log(md);
    else console.log(`No dojo active. Add one with:\n  ${CLI} add <source>`);
    return;
  }

  const md = readDojoMd(root, rc.currentDojo);
  if (md) console.log(md);
  else console.log(`Dojo "${rc.currentDojo}" has no DOJO.md.`);

  // Mark dojo as introduced
  rc.progress ??= {};
  rc.progress[rc.currentDojo] ??= { completed: [], lastActive: null };
  rc.progress[rc.currentDojo].introduced = true;
  writeDojoRc(root, rc);

  const dojos = listDojos(root);
  if (dojos.length > 1) {
    const others = dojos.filter((d) => d !== rc.currentDojo);
    const options = others.map((d) => `- "${d}" → run: ${CLI} --change ${d}`).join("\n");
    console.log(`\nInvoke AskUserQuestion to ask the student:
- "Continue with ${rc.currentDojo}" → run: ${CLI} kata --start
${options}`);
  }
}
