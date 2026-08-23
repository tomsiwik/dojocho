import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lesson-mcp.ts"],
  format: ["esm"],
  target: "node22",
  removeNodeProtocol: false,
  external: ["node:sqlite"],
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
