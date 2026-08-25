import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readDojoRc } from "@dojofoo/config";
import { dojoLessonContext, dojoLessonFragment, getLesson, nextLesson, shouldIntroduceLesson, writeLessonFile } from "./service";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function freshCourse(): string {
  const root = mkdtempSync(join(tmpdir(), "dojofoo-fresh-course-"));
  roots.push(root);
  writeFileSync(resolve(root, ".dojorc"), JSON.stringify({
    currentDojo: "starter",
    currentKata: null,
    editor: "code",
    progress: {},
  }));
  const lesson = resolve(root, ".dojos", "starter", "katas", "001-first");
  mkdirSync(lesson, { recursive: true });
  writeFileSync(resolve(root, ".dojos", "starter", "dojo.yaml"), [
    "name: '@test/starter'",
    "version: 1.0.0",
    "description: A fresh course.",
    "test: echo ok",
    "katas:",
    "  - name: 001-first",
    "    template: katas/001-first/solution.ts",
    "  - name: 002-second",
    "    template: katas/002-second/solution.ts",
  ].join("\n"));
  writeFileSync(resolve(root, ".dojos", "starter", "DOJO.md"), "Teach carefully.");
  writeFileSync(resolve(lesson, "SENSEI.md"), "# First lesson\n\nBegin here.");
  writeFileSync(resolve(lesson, "solution.ts"), "export const answer = 0;\n");
  const second = resolve(root, ".dojos", "starter", "katas", "002-second");
  mkdirSync(second, { recursive: true });
  writeFileSync(resolve(second, "SENSEI.md"), "# Second lesson\n\nContinue here.");
  writeFileSync(resolve(second, "solution.ts"), "export const second = 0;\n");
  return root;
}

describe("fresh lesson state", () => {
  it("retries an introduction until the lifecycle marks it complete", () => {
    expect(shouldIntroduceLesson({ introduced: false })).toBe(true);
    expect(shouldIntroduceLesson({ introduced: true })).toBe(false);
  });

  it("presents the first lesson without requiring mutable current-kata state", async () => {
    const lesson = await getLesson(freshCourse(), "001-first");

    expect(lesson).toMatchObject({
      kata: "001-first",
      state: "not-started",
      isCurrent: true,
      code: "export const answer = 0;\n",
      starterCode: "export const answer = 0;\n",
    });
  });

  it("gives the sensei authoritative learner code without requiring file inspection", async () => {
    const lesson = await getLesson(freshCourse(), "001-first");

    expect(dojoLessonContext(lesson!).learner.file).toEqual({
      path: "katas/001-first/solution.ts",
      language: "typescript",
      content: "export const answer = 0;\n",
    });
  });

  it("persists the active lesson when its file is first saved", async () => {
    const root = freshCourse();

    await writeLessonFile(root, "starter", "001-first", "solution", "export const answer = 1;\n");

    expect(readDojoRc(root)).toMatchObject({
      currentKata: "001-first",
      progress: { starter: { completed: [], lastActive: "001-first" } },
    });
    expect(readFileSync(resolve(root, "katas", "001-first", "solution.ts"), "utf8"))
      .toBe("export const answer = 1;\n");
  });

  it("advances by materializing the next lesson without spawning the CLI", async () => {
    const root = freshCourse();
    const rc = readDojoRc(root);
    rc.currentKata = "001-first";
    rc.progress = { starter: { completed: ["001-first"], lastActive: "001-first" } };
    writeFileSync(resolve(root, ".dojorc"), `${JSON.stringify(rc)}\n`);

    const next = await nextLesson(root, { checkpointCurrent: false });

    expect(next).toMatchObject({ kata: "002-second", isCurrent: true, state: "ongoing" });
    expect(readFileSync(resolve(root, "katas/002-second/solution.ts"), "utf8"))
      .toBe("export const second = 0;\n");
  });

  it("allows only authored fragments from the active lesson", async () => {
    const root = freshCourse();
    const lessonPath = resolve(root, ".dojos", "starter", "katas", "001-first", "SENSEI.md");
    writeFileSync(lessonPath, '# First lesson\n\n<Present id="example">Visible material</Present>');
    const lesson = await getLesson(root, "001-first");
    expect(lesson).not.toBeNull();

    expect(dojoLessonFragment(lesson!, "example")).toEqual({ fragmentId: "example" });
    expect(() => dojoLessonFragment(lesson!, "invented")).toThrow("Lesson fragment not found");
  });
});
