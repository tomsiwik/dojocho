import { createFileRoute } from "@tanstack/react-router";
import { app } from "@/server/app";

/**
 * Top-level catch-all → Hono.
 *
 * TanStack Start picks more-specific routes (e.g. `index.tsx` for `/`)
 * over this splat, so React routes still work; everything else
 * (`/api/...`, `/.well-known/...`, etc.) is handled by the Hono app.
 *
 * We use a top-level splat instead of `routes/api/$.ts` because the
 * router-plugin filters dot-prefixed folders, breaking
 * `routes/.well-known/...`. One catch-all is the simpler and more
 * future-proof option.
 */
const serve = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/$")({
  server: {
    handlers: {
      GET: serve,
      POST: serve,
      PUT: serve,
      DELETE: serve,
      PATCH: serve,
      OPTIONS: serve,
      HEAD: serve,
    },
  },
});
