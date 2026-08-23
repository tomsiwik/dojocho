import { describe, expect, it } from "vitest";
import { RunCoordinator } from "./coordinator";

describe("RunCoordinator", () => {
  it("routes a command through an ephemeral capability without exposing a session ID", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", async (question) => ({ decision: [question.options[0]!.id] }));

    await expect(coordinator.ask("secret", {
      title: "Continue?",
      options: [{ id: "yes", title: "Yes" }, { id: "no", title: "No" }],
    })).resolves.toEqual({ decision: ["yes"] });
  });

  it("rejects commands after the run detaches", async () => {
    const coordinator = new RunCoordinator();
    coordinator.attach("secret", async () => ({ decision: ["yes"] }));
    coordinator.detach("secret");

    await expect(coordinator.ask("secret", { title: "Continue?", options: [] }))
      .rejects.toThrow("no longer active");
  });
});
