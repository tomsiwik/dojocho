import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { dojoDir } from "./config";

export function journalPath(root: string, dojo: string): string {
  return resolve(dojoDir(root, dojo), "JOURNAL.md");
}

export function appendNote(
  root: string,
  dojo: string,
  kata: string,
  note: string,
): void {
  const path = journalPath(root, dojo);
  const date = new Date().toISOString().slice(0, 10);

  let content: string;
  if (existsSync(path)) {
    content = readFileSync(path, "utf8");
  } else {
    mkdirSync(dirname(path), { recursive: true });
    content = "# Learning Journal\n";
  }

  const heading = `## ${kata}`;
  if (content.includes(heading)) {
    // Append note at end of existing kata section
    const headingIdx = content.indexOf(heading);
    const nextHeading = content.indexOf("\n## ", headingIdx + heading.length);
    const insertIdx = nextHeading === -1 ? content.length : nextHeading;
    const before = content.slice(0, insertIdx).trimEnd();
    const after = content.slice(insertIdx);
    content = before + `\n- ${note}\n` + after;
  } else {
    // New kata section
    content += `\n${heading}\n_${date}_\n\n- ${note}\n`;
  }

  writeFileSync(path, content);
}

export function readLearnings(root: string, dojo: string): string {
  const path = journalPath(root, dojo);
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}
