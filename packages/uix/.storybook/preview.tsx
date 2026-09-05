import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "../src/styles.css";

const fontStacks = {
  default:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  common:
    '"Inter Variable", Inter, "Helvetica Rounded", Helvetica, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  modern:
    '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", Geist, "Geist Sans", "Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
} as const;

type FontStack = keyof typeof fontStacks;

const tailwindTextSizes = {
  "--text-xs": "0.75rem",
  "--text-sm": "0.875rem",
  "--text-base": "1rem",
  "--text-lg": "1.125rem",
  "--text-xl": "1.25rem",
  "--text-2xl": "1.5rem",
  "--text-3xl": "1.875rem",
  "--text-4xl": "2.25rem",
  "--text-5xl": "3rem",
  "--text-6xl": "3.75rem",
  "--text-7xl": "4.5rem",
  "--text-8xl": "6rem",
  "--text-9xl": "8rem",
} as const;

const preview: Preview = {
  globalTypes: {
    font: {
      description: "Global font stack",
      toolbar: {
        icon: "paragraph",
        items: [
          { value: "default", title: "Default" },
          { value: "common", title: "Common" },
          { value: "modern", title: "Modern" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    font: "default",
  },
  parameters: {
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const font = context.globals.font as FontStack;
      const fontFamily = fontStacks[font] ?? fontStacks.default;

      document.documentElement.lang = "en";
      document.documentElement.classList.add("h-full");
      document.documentElement.style.fontSize = "16px";
      document.documentElement.style.setProperty("--font-sans", fontFamily);
      if (font === "modern") {
        document.documentElement.style.setProperty("--font-weight-normal", "540");
        document.documentElement.style.setProperty("--font-weight-medium", "620");
      } else {
        document.documentElement.style.removeProperty("--font-weight-normal");
        document.documentElement.style.removeProperty("--font-weight-medium");
      }
      for (const [token, size] of Object.entries(tailwindTextSizes)) {
        if (font === "modern") {
          document.documentElement.style.setProperty(
            token,
            `calc(${size} * 0.9375)`,
          );
        } else {
          document.documentElement.style.removeProperty(token);
        }
      }
      document.body.classList.add(
        "m-0",
        "h-full",
        "overflow-hidden",
        "bg-background",
        "text-foreground",
        "antialiased",
      );
      document.body.style.fontFamily = "var(--font-sans)";
      document.body.style.fontWeight = "var(--font-weight-normal)";
      return <Story />;
    },
  ],
};

export default preview;
