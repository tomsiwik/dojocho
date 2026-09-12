import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Hono } from "hono";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { mountEveAuthoring } from "./authoring-eve";

describe("authoring Eve mount", () => {
  it("leaves ACP unchanged when no Eve host was configured", async () => {
    const app = new Hono();
    const root = vi.fn(() => { throw new Error("Must not resolve an Eve workspace"); });
    mountEveAuthoring(app, { root, resolveWorkspace: root });
    expect(await (await app.request("/backend")).json()).toEqual({ backend: "acp" });
    expect((await app.request("/eve/sessions", { method: "POST" })).status).toBe(404);
    expect(root).not.toHaveBeenCalled();
  });

  it("mounts the configured host only for its own workspace", async () => {
    const root = mkdtempSync(join(tmpdir(), "dojo-eve-mount-"));
    const other = mkdtempSync(join(tmpdir(), "dojo-eve-other-"));
    onTestFinished(() => { rmSync(root, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true }); });
    const app = new Hono();
    mountEveAuthoring(app, { host: "http://127.0.0.1:2000", root: () => root, resolveWorkspace: request => new URL(request.url).searchParams.has("other") ? other : root });
    expect(await (await app.request("/backend")).json()).toEqual({ backend: "eve" });
    expect((await app.request("/backend?other=1")).status).toBe(403);
    expect((await app.request("/eve/sessions?other=1", { method: "POST", body: JSON.stringify({ message: "Hello" }) })).status).toBe(403);
    // Input validation proves the mounted route was reached, without inference.
    expect((await app.request("/eve/sessions", { method: "POST", body: "{}" })).status).toBe(422);
  });
});
