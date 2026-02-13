import { defineConfig } from "vitest/config"
import config from "../../../dojo.config.js"

export default defineConfig({
  test: {
    include: ["katas/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/katas": config.katasPath,
    },
  },
})
