import { Hono } from "hono";
import {
  DefaultRequestHandler,
  DefaultExecutionEventBusManager,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";

import { buildAgentCard } from "./agent-card";
import { EchoExecutor } from "./executor";
import { honoAgentCardHandler } from "./a2a/agent-card";
import { honoJsonRpcHandler } from "./a2a/jsonrpc";

/**
 * Construct the Hono app that owns all A2A routes.
 *
 * Mounted into TanStack Start via `src/routes/api/$.ts` and
 * `src/routes/.well-known/agent-card.json.ts` — both delegate to
 * `app.fetch(request)`.
 */
function buildApp() {
  // Resolve the agent card lazily so it picks up the request's host. The
  // pattern below assumes single-host dev (localhost:4567); a reverse
  // proxy / production deploy can swap to reading the forwarded headers.
  const baseUrl = process.env.DOJO_UI_BASE_URL || "http://localhost:4567";
  const agentCard = buildAgentCard({ baseUrl });

  const taskStore = new InMemoryTaskStore();
  const executor = new EchoExecutor();
  const eventBusManager = new DefaultExecutionEventBusManager();
  const requestHandler = new DefaultRequestHandler(
    agentCard,
    taskStore,
    executor,
    eventBusManager,
  );

  const app = new Hono();

  // CORS: localhost-only for now. Will revisit when we expose past the box.
  app.use("*", async (c, next) => {
    if (c.req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    await next();
    c.res.headers.set("Access-Control-Allow-Origin", "*");
  });

  // Liveness.
  app.get("/api/health", (c) => c.json({ ok: true, version: agentCard.version }));

  // A2A endpoints.
  app.get("/.well-known/agent-card.json", honoAgentCardHandler(requestHandler));
  app.post("/api/a2a/jsonrpc", honoJsonRpcHandler(requestHandler));

  return app;
}

export const app = buildApp();
