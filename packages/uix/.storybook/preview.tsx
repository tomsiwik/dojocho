import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      document.documentElement.lang = "en";
      document.documentElement.classList.add("h-full");
      document.body.classList.add(
        "m-0",
        "h-full",
        "overflow-hidden",
        "bg-background",
        "text-foreground",
        "antialiased",
      );
      return <Story />;
    },
  ],
};

export default preview;
