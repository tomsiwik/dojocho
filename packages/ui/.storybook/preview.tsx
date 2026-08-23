import type { Preview } from "@storybook/react-vite";
import { ShapeProvider } from "../src/lib/shape-context";
import "../src/app.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const dark = context.globals.mode === "dark";
      document.documentElement.classList.toggle("dark", dark);
      document.body.classList.toggle("dark", dark);
      document.documentElement.lang = "en";
      document.body.classList.add("m-0", "min-h-screen", "bg-background", "font-sans", "text-foreground", "antialiased");
      try { window.localStorage.setItem("dojofoo-storybook-mode", dark ? "dark" : "light"); } catch {}
      return <ShapeProvider defaultShape="square"><Story /></ShapeProvider>;
    },
  ],
  globalTypes: {
    mode: {
      name: "Mode",
      description: "Dojofoo color mode",
      defaultValue: (() => {
        try { return window.localStorage.getItem("dojofoo-storybook-mode") ?? "dark"; } catch { return "dark"; }
      })(),
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
