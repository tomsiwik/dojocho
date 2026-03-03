import { loadConfig } from "./index";
import {
  defineConfig as vitestDefineConfig,
  mergeConfig,
  type ViteUserConfig,
} from "vitest/config";

export { mergeConfig } from "vitest/config";

export function defineConfig(
  overrides: ViteUserConfig = {},
): ReturnType<typeof vitestDefineConfig> {
  const dojo = loadConfig();
  const defaults = vitestDefineConfig({
    test: {
      include: ["katas/**/*.test.ts"],
    },
    resolve: {
      alias: {
        "@/katas": dojo.katasPath,
      },
    },
  });
  return mergeConfig(defaults, overrides);
}
