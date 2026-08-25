import { describe, expect, it } from "vitest";
import { RunCoordinator } from "./coordinator";

describe("RunCoordinator", () => {
  it("routes a command through an ephemeral capability without exposing a session ID", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", {
      ask: async (question) => ({ decision: [question.options[0]!.id] }),
      context: () => ({ lesson: "one" }),
      show: (fragmentId) => ({ fragmentId }),
    });

    await expect(coordinator.ask("secret", {
      title: "Continue?",
      options: [{ id: "yes", title: "Yes" }, { id: "no", title: "No" }],
    })).resolves.toEqual({ decision: ["yes"] });
  });

  it("returns context through the same run capability", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", {
      ask: async () => ({}),
      context: () => ({ lesson: "one" }),
      show: (fragmentId) => ({ fragmentId }),
    });

    await expect(coordinator.context("secret")).resolves.toEqual({ lesson: "one" });
  });

  it("validates and returns a lesson fragment through the active run", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", {
      ask: async () => ({}),
      context: () => ({}),
      show: (fragmentId) => ({ fragmentId }),
    });

    await expect(coordinator.show("secret", "whitespace-runs"))
      .resolves.toEqual({ fragmentId: "whitespace-runs" });
  });

  it("rejects commands after the run detaches", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", {
      ask: async () => ({ decision: ["yes"] }),
      context: () => ({}),
      show: (fragmentId) => ({ fragmentId }),
    });
    coordinator.detach("secret");

    await expect(coordinator.ask("secret", { title: "Continue?", options: [] }))
      .rejects.toThrow("no longer active");
  });
});
