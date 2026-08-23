import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("API error responses", () => {
  it("returns thrown API failures as JSON", async () => {
    const response = await app.request(
      "/api/workspaces/missing/courses/starter/lessons/001-first",
    );

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      error: "The selected dojo workspace is no longer available.",
    });
  });
});
