import { describe, expect, it, vi } from "vitest";
import { GitHubCourseRegistrar } from "../src/github-registrar";

describe("GitHubCourseRegistrar", () => {
  it("validates a public repository manifest and persists a marketplace snapshot", async () => {
    const manifest = {
      name: "@acme/typescript-basics",
      version: "0.0.1",
      description: "Learn TypeScript basics.",
      author: "Ada Lovelace",
      language: "TypeScript",
      framework: "Effect",
      tags: ["Values"],
      test: "npx vitest run {template}",
      katas: [{
        name: "001-values",
        template: "katas/001-values/solution.ts",
        tags: ["Values"],
      }],
    };
    const fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/repos/acme/typescript-basics")) {
        return Response.json({
          private: false,
          default_branch: "main",
          pushed_at: "2026-08-11T10:00:00.000Z",
        });
      }
      if (url.includes("/git/trees/main?recursive=1")) {
        return Response.json({
          sha: "commit-sha",
          tree: [
            { path: "dojo.json", type: "blob", size: 500 },
            { path: "DOJO.md", type: "blob", size: 100 },
            { path: "katas/001-values/KATA.md", type: "blob", size: 100 },
          ],
        });
      }
      if (url.endsWith("/dojo.json")) {
        return new Response(JSON.stringify(manifest));
      }
      if (url.endsWith("/DOJO.md")) return new Response("# TypeScript Basics");
      if (url.endsWith("/katas/001-values/KATA.md")) return new Response("# Values");
      return new Response("missing", { status: 404 });
    });
    const saved: unknown[] = [];
    const registrar = new GitHubCourseRegistrar({
      fetch,
      store: { upsert: async (value) => { saved.push(value); } },
    });

    const registered = await registrar.register({
      type: "github",
      repository: "acme/typescript-basics",
      integrity: "sha256-client-archive",
    });

    expect(registered).toMatchObject({
      id: "acme/typescript-basics",
      source: "acme",
      slug: "typescript-basics",
      name: "TypeScript Basics",
      sourceType: "github",
      installUrl: "acme/typescript-basics",
      author: "Ada Lovelace",
      language: "TypeScript",
      framework: "Effect",
      tags: ["Values"],
      katas: ["001-values"],
      hash: "commit-sha",
    });
    expect(registered?.files).toEqual([
      { path: "DOJO.md", contents: "# TypeScript Basics" },
      { path: "dojo.json", contents: JSON.stringify(manifest) },
      { path: "katas/001-values/KATA.md", contents: "# Values" },
    ]);
    expect(saved).toEqual([registered]);
  });

  it("rejects private repositories", async () => {
    const privateFetch = vi.fn(async () => Response.json({ private: true }));
    const registrar = new GitHubCourseRegistrar({
      fetch: privateFetch,
      store: { upsert: async () => undefined },
    });

    expect(await registrar.register({ type: "github", repository: "acme/private" })).toBeNull();
  });

  it("registers a YAML-authored interactive course with its MDX and artifacts", async () => {
    const manifest = [
      "name: '@acme/learn-python'",
      "version: 1.0.0",
      "description: Learn Python interactively.",
      "mode: interactive",
      "lessons: lessons",
    ].join("\n");
    const files = new Map([
      ["dojo.yaml", manifest],
      ["lessons/install/lesson.json", JSON.stringify({ id: "install", title: "Install", steps: [] })],
      ["content/install.mdx", "# Install Python"],
      ["assets/python.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\" />"],
      ["components/check.html", "<!doctype html><title>Check</title>"],
      ["mise.toml", "[tools]\npython = \"3.13\""],
    ]);
    const fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/repos/acme/learn-python")) {
        return Response.json({ private: false, default_branch: "main" });
      }
      if (url.includes("/git/trees/main?recursive=1")) {
        return Response.json({
          sha: "interactive-sha",
          tree: [...files].map(([path, contents]) => ({ path, type: "blob", size: contents.length })),
        });
      }
      const path = [...files.keys()].find((candidate) => url.endsWith(`/${candidate}`));
      return path ? new Response(files.get(path)) : new Response("missing", { status: 404 });
    });
    const upsert = vi.fn();

    const registered = await new GitHubCourseRegistrar({ fetch, store: { upsert } }).register({
      type: "github",
      repository: "acme/learn-python",
    });

    expect(registered).toMatchObject({ mode: "interactive", katas: [], hash: "interactive-sha" });
    expect(registered?.files.map(({ path }) => path)).toEqual([...files.keys()].sort());
    expect(upsert).toHaveBeenCalledWith(registered);
  });

  it("rejects a repository whose dojo manifest is invalid", async () => {
    const fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/repos/acme/invalid")) {
        return Response.json({ private: false, default_branch: "main" });
      }
      if (url.includes("/git/trees/main?recursive=1")) {
        return Response.json({ sha: "invalid-sha", tree: [
          { path: "dojo.json", type: "blob", size: 2 },
        ] });
      }
      return new Response(JSON.stringify({
        name: "@acme/invalid",
        version: "0.0.1",
        description: "Invalid duplicate facets.",
        language: "TypeScript",
        framework: "Effect",
        tags: ["effect"],
        test: "true",
        katas: [{ template: "katas/001/solution.ts" }],
      }));
    });
    const upsert = vi.fn();
    const registrar = new GitHubCourseRegistrar({
      fetch,
      store: { upsert },
    });

    expect(await registrar.register({ type: "github", repository: "acme/invalid" })).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });
});
