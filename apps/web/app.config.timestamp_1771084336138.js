// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";
var app_config_default = defineConfig({
  server: {
    preset: "static",
    prerender: {
      routes: ["/"],
      crawlLinks: true
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
export {
  app_config_default as default
};
