import { CLI, readDojoRc, writeDojoRc, readDojoMd, listDojos } from "../config";
import { sensei, prompt, invokeAsk } from "../format";

export function intro(root: string, args: string[]): void {
  if (args.includes("--done")) {
    markDone(root);
    return;
  }

  present(root);
}

function present(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    const md = readDojoMd(root, "");
    if (md) console.log(sensei(md));
    else console.log(`No dojo active. Add one with:\n  ${CLI} add <source>`);
    return;
  }

  const md = readDojoMd(root, rc.currentDojo);
  if (md) console.log(sensei(md));
  else console.log(`Dojo "${rc.currentDojo}" has no DOJO.md.`);

  const dojos = listDojos(root);
  const others = dojos.filter((d) => d !== rc.currentDojo);
  const switchOptions = others.length > 0
    ? "\n" + others.map((d) => `- "${d}" (Switch to this dojo) → run: ${CLI} --change ${d}`).join("\n")
    : "";

  console.log(prompt(`Introduce the dojo to the student using the <dojo:sensei> content above.
Explain what they'll be learning, how katas work (short exercises with tests to guide them), and what to expect.
Do NOT paste the sensei content verbatim — summarize and present it in your own words.

Then ${invokeAsk()} to ask the student:
- "Let's begin" (Start the first kata) → run: ${CLI} intro --done
- "Tell me more" (Ask questions about the dojo before starting) → answer using the sensei content, then ask again${switchOptions}`));
}

function markDone(root: string): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    console.log(`No dojo active.`);
    return;
  }

  rc.progress ??= {};
  rc.progress[rc.currentDojo] ??= { completed: [], lastActive: null };
  rc.progress[rc.currentDojo].introduced = true;
  writeDojoRc(root, rc);

  console.log(`Dojo "${rc.currentDojo}" introduction complete.`);
}
