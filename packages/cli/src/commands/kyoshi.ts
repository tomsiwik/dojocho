import { scaffoldAuthoringWorkspace, type AuthoringStyle } from "@dojofoo/authoring/scaffold";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { observeWorkspacePath } from "@dojofoo/config/local-state";
import { ui } from "./ui";

export type TeachingStyle = AuthoringStyle;

export async function kyoshi(root: string, args: string[]): Promise<void> {
  const style = await selectTeachingStyle(valueAfter(args, "--style"));
  scaffoldAuthoringWorkspace({
    root,
    style,
    name: valueAfter(args, "--name") ?? basename(resolve(root)),
  });
  observeWorkspacePath(root);
  process.stdout.write(`Kyoshi workspace ready in ${resolve(root)}\n`);
  await ui(root, ["--authoring", ...forwardedUiArgs(args)]);
}

async function selectTeachingStyle(requested?: string): Promise<TeachingStyle> {
  if (requested) {
    if (requested !== "katas") throw new Error(`Unsupported teaching style: ${requested}`);
    return requested;
  }
  if (!(process.stdin.isTTY && process.stdout.isTTY)) return "katas";
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write("Teaching style:\n  1. Katas\n");
    while (true) {
      const answer = (await readline.question("Select a style: ")).trim().toLowerCase();
      if (answer === "1" || answer === "kata" || answer === "katas") return "katas";
      process.stdout.write("Select 1 or katas.\n");
    }
  } finally {
    readline.close();
  }
}

function forwardedUiArgs(args: string[]): string[] {
  const result = ["--background", "--no-open", "--no-portless"]
    .filter((flag) => args.includes(flag));
  for (const flag of ["--port", "--tld"]) {
    const value = valueAfter(args, flag);
    if (value) result.push(flag, value);
  }
  return result;
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1];
  return args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1);
}
