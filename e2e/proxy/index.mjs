import { Hono } from "hono/tiny";
import { proxy } from "hono/proxy";
import { serve } from "@hono/node-server";

serve({ port: 4000, fetch: new Hono().post("/v1/responses", async (c) => {
  const body = await c.req.json();
  body.metadata = body.client_metadata; delete body.client_metadata;
  return proxy("https://api.groq.com/openai/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}).fetch });
