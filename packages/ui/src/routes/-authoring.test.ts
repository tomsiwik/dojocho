import type { AuthoringWorkspace } from "@dojofoo/authoring/service";
import { describe, expect, it } from "vitest";
import { authoringFiles, authoringFileUrl } from "./authoring";

const workspace: AuthoringWorkspace = {
  root: "/tmp/course",
  style: "katas",
  name: "Course",
  description: "Description",
  manifestSource: "name: course\n",
  courseGuidance: "# Course\n",
  language: "TypeScript",
  issues: [],
  courseChecks: [],
  sessionId: "session",
  messages: [],
  lessons: [{
    id: "001-first",
    title: "First",
    description: "Practice one thing.",
    briefingPath: "src/001-first/KATA.md",
    briefing: "# First\n",
    senseiPath: "src/001-first/SENSEI.md",
    sensei: "# Sensei\n",
    evalPath: "evals/lessons/001-first.json",
    evalDefinition: "{}\n",
    hasSensei: true,
    hasEval: true,
    checks: [],
  }],
};

describe("authoring workspace files", () => {
  it("maps course and lesson UI tabs directly to source-of-truth files", () => {
    expect(authoringFiles(workspace, null).map(({ path }) => path)).toEqual([
      "dojo.yaml",
      "DOJO.md",
    ]);
    expect(authoringFiles(workspace, workspace.lessons[0]).map(({ path }) => path)).toEqual([
      "src/001-first/KATA.md",
      "src/001-first/SENSEI.md",
      "evals/lessons/001-first.json",
    ]);
    expect(authoringFileUrl("src/001 first/KATA.md"))
      .toBe("/api/authoring/files/src/001%20first/KATA.md");
  });
});
