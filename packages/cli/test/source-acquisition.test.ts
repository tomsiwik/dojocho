import { describe, expect, it, vi } from "vitest";
import { acquireRemoteDojo, gigetLocator } from "../src/source-acquisition";

const { downloadTemplate } = vi.hoisted(() => ({
  downloadTemplate: vi.fn(async (_source: string, options: { dir: string }) => ({
    dir: options.dir,
    source: "resolved",
  })),
}));

vi.mock("giget", () => ({ downloadTemplate }));

describe("Giget dojo acquisition", () => {
  it("normalizes GitHub shorthand without changing generic URLs", () => {
    expect(gigetLocator("dojofoo/starter-kata", "github")).toBe("gh:dojofoo/starter-kata");
    expect(gigetLocator("https://example.com/dojo.tgz", "url")).toBe("https://example.com/dojo.tgz");
  });

  it("downloads into caller-owned staging without installing dependencies", async () => {
    await expect(acquireRemoteDojo("dojofoo/starter-kata", "github", "/tmp/staged-dojo"))
      .resolves.toBe("/tmp/staged-dojo");
    expect(downloadTemplate).toHaveBeenCalledWith("gh:dojofoo/starter-kata", {
      dir: "/tmp/staged-dojo",
      force: false,
      install: false,
    });
  });
});
