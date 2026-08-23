import { describe, expect, it } from "vitest";
import { parseManifest, resolveConfig, validateManifest } from "../src/config";

describe("configuration defaults", () => {
  it("uses the stable Vercel registry while the custom domain DNS is unavailable", () => {
    expect(resolveConfig({}, "/tmp/dojofoo").registries).toMatchObject({
      dojofoo: "https://dojofoo.vercel.app/r/{name}.json",
    });
  });
});

describe("course discovery metadata", () => {
  it("parses a documented YAML manifest", () => {
    expect(parseManifest(`
# Inline author guidance remains outside the data model.
mode: interactive
name: "@acme/learning"
version: 1.0.0
description: Learn through authored MDX.
lessons: lessons/introduction.json
`, "/course/dojo.yaml")).toMatchObject({
      mode: "interactive",
      name: "@acme/learning",
      lessons: "lessons/introduction.json",
    });
  });

  it("accepts a minimal interactive course without kata fields", () => {
    expect(validateManifest({
      mode: "interactive",
      name: "@acme/learning",
      version: "1.0.0",
      description: "Learn through authored interactions.",
      lessons: "lessons/introduction.json",
    })).toEqual([]);
  });

  it("accepts language, framework, author, and topical tags", () => {
    expect(validateManifest({
      name: "@acme/effect",
      version: "1.0.0",
      description: "Learn Effect.",
      author: "Ada Lovelace",
      language: "TypeScript",
      framework: "Effect",
      tags: ["Functional programming"],
      test: "pnpm test {template}",
      katas: [{ template: "katas/001/solution.ts" }],
    })).toEqual([]);
  });

  it("rejects tags that repeat the language or framework facets", () => {
    expect(validateManifest({
      name: "@acme/effect",
      version: "1.0.0",
      description: "Learn Effect.",
      language: "TypeScript",
      framework: "Effect",
      tags: ["typescript", "EFFECT", "Functional programming"],
      test: "pnpm test {template}",
      katas: [{ template: "katas/001/solution.ts" }],
    })).toEqual([
      '"tags" must not repeat "language" or "framework"',
    ]);
  });
});
