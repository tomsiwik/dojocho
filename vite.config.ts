import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,ts,tsx}": "vp check --fix",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["dojos/*/katas/**", "dojos/llm-from-scratch/**", "**/dist/**"],
  },
});
