import { realpathSync } from "node:fs";
import { Client } from "@dojofoo/agent/client";
import { createEveAuthoringRoutes } from "@dojofoo/authoring/eve/server";
import type { Hono, MiddlewareHandler } from "hono";

/** An explicitly configured Eve host belongs to one course workspace. */
export function mountEveAuthoring(app: Hono, options: {
  host?: string;
  root(): string;
  resolveWorkspace(request: Request): string;
}) {
  if (!options.host) {
    app.get("/backend", c => c.json({ backend: "acp" }));
    return;
  }
  const root = realpathSync(options.root());
  const scope: MiddlewareHandler = async (c, next) => {
    if (realpathSync(options.resolveWorkspace(c.req.raw)) !== root) {
      return c.json({ error: "This Eve host belongs to a different authoring workspace." }, 403);
    }
    await next();
  };
  app.use("/backend", scope);
  app.use("/eve/*", scope);
  app.get("/backend", c => c.json({ backend: "eve" }));
  app.route("/eve", createEveAuthoringRoutes(new Client({ host: options.host })));
}
