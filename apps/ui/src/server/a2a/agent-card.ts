import type { Context } from "hono";
import type { A2ARequestHandler } from "@a2a-js/sdk/server";

/**
 * Hono GET handler for the A2A Agent Card.
 *
 * Equivalent of @a2a-js/sdk's express `agentCardHandler`, ported to Hono.
 * Returns the card from the request handler's `getAgentCard()`.
 */
export function honoAgentCardHandler(requestHandler: A2ARequestHandler) {
  return async (c: Context) => {
    try {
      const card = await requestHandler.getAgentCard();
      return c.json(card);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: `Error fetching agent card: ${message}` }, 500);
    }
  };
}
