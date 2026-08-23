import { Hono } from "hono";
import { runCoordinator, type RunQuestion } from "./coordinator";

export const runRoutes = new Hono().post("/", async (c) => {
  const authorization = c.req.header("authorization");
  const capability = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!capability) return c.json({ error: "A run capability is required" }, 401);
  const body = await c.req.json<{ method?: string; params?: RunQuestion }>();
  if (body.method !== "run.ask" || !body.params?.title || body.params.options.length < 2) {
    return c.json({ error: "Invalid run command" }, 422);
  }
  try {
    return c.json({ answers: await runCoordinator.ask(capability, body.params) });
  } catch (cause) {
    return c.json({ error: cause instanceof Error ? cause.message : "Run command failed" }, 409);
  }
});
