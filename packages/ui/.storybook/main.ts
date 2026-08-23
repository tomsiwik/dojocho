import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  viteFinal: async (viteConfig) => {
    const plugins = (viteConfig.plugins ?? []).flat(Number.POSITIVE_INFINITY).filter((plugin) => {
      if (!(plugin && typeof plugin === "object" && "name" in plugin)) return true;
      return !/(?:tanstack|nitro|tailwindcss)/u.test(String(plugin.name));
    });
    return {
      ...viteConfig,
      plugins: [tailwindcss(), ...plugins],
      resolve: {
        ...viteConfig.resolve,
        alias: {
          ...(typeof viteConfig.resolve?.alias === "object" ? viteConfig.resolve.alias : {}),
          "@": fileURLToPath(new URL("../src", import.meta.url)),
        },
      },
    };
  },
};

export default config;
