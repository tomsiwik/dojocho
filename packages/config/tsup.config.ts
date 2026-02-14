import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    vitest: "src/vitest.ts",
  },
  format: ["esm"],
  target: "node20",
  clean: true,
  dts: true,
  external: ["vitest", "vitest/config", "jiti"],
});
