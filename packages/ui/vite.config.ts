import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { eveSvelteKit } from "@dojofoo/agent/sveltekit";

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 4567,
    host: process.env.HOST || "localhost",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  ssr: {
    // jiti loads supporting files relative to its package at runtime.
    external: ["jiti", "typescript"],
  },
  build: {
    rolldownOptions: {
      external: ["jiti", "typescript"],
    },
  },
  plugins: [
    // Eve's public Vite development hook owns host reuse and startup. Its
    // SvelteKit/Vercel build hooks must not run for our TanStack application.
    // Start before Nitro captures the environment for its server worker.
    process.env.DOJO_EVE_ROOT
      ? { ...eveSvelteKit({ eveRoot: process.env.DOJO_EVE_ROOT }), apply: "serve" as const, enforce: "pre" as const }
      : undefined,
    tailwindcss(),
    tanstackStart(),
    react(),
    nitro({
      // Default node-server preset for local dev / `npx dojofoo ui`.
      // Override at deploy time (e.g. preset: "vercel") if/when we host this.
      preset: "node-server",
      serverDir: "./server",
      features: { websocket: process.env.VITEST !== "true" },
      routeRules: {
        "/**": { headers: { "cache-control": "no-store" } },
        "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      },
      // Streaming responses are required for A2A `message/stream` (SSE).
      // Local node-server preset supports streaming out of the box.
    }),
  ],
});
