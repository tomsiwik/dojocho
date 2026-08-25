import { describe, expect, it } from "vitest";
import { groupCourses } from "./index";

describe("course index grouping", () => {
  it("renders one course choice across multiple workspaces", () => {
    const course = {
      runId: null,
      dojo: "starter-kata",
      description: "Starter",
      language: "TypeScript",
      framework: null,
      tags: [],
      mode: "katas" as const,
      kata: "001-normalize-handle",
      sessionId: null,
      sessions: [],
      selected: false,
      lastSeenAt: 1,
    };
    const groups = groupCourses([
      { ...course, workspaceId: "workspace-a", workspaceName: "alpha", path: "/tmp/alpha" },
      { ...course, workspaceId: "workspace-b", workspaceName: "beta", path: "/tmp/beta" },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ dojo: "starter-kata" });
    expect(groups[0]?.workspaces.map((workspace) => workspace.workspaceId)).toEqual(["workspace-a", "workspace-b"]);
  });

  it("keeps different courses separate", () => {
    const groups = groupCourses([
      { workspaceId: "a", runId: null, dojo: "starter-kata", description: "", language: "TypeScript", framework: null, tags: [], mode: "katas", kata: null, path: "/a", workspaceName: "a", lastSeenAt: 1, selected: false, sessionId: null, sessions: [] },
      { workspaceId: "b", runId: null, dojo: "starter-interactive", description: "", language: "TypeScript", framework: null, tags: [], mode: "interactive", kata: null, path: "/b", workspaceName: "b", lastSeenAt: 2, selected: false, sessionId: null, sessions: [] },
    ]);

    expect(groups.map((group) => group.dojo)).toEqual(["starter-kata", "starter-interactive"]);
  });
});
