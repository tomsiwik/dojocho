import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Button } from "./base";

const GEIST_COLORS = [
  { label: "Blue", surface: "#0072f5", text: "#fff" },
  { label: "Red", surface: "#e5484d", text: "#fff" },
  {
    label: "Amber",
    surface: "#ffb224",
    text: "#4e2009",
  },
  { label: "Green", surface: "#45a557", text: "#fff" },
  { label: "Teal", surface: "#12a594", text: "#fff" },
  { label: "Purple", surface: "#8e4ec6", text: "#fff" },
] as const;

function geistButtonStyle(surface: string, text: string): CSSProperties {
  return {
    "--primary": surface,
    "--primary-foreground": text,
    "--button-primary-hover":
      "color-mix(in oklch, var(--primary) 90%, white 10%)",
    "--button-primary-depth":
      "oklch(from var(--primary) calc(0.96 * pow(l, 1.25)) c h)",
  } as CSSProperties;
}

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    pressScale: 0.98,
    ripple: true,
  },
  argTypes: {
    pressScale: {
      control: { type: "range", min: 0.8, max: 1, step: 0.01 },
    },
    ripple: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pressScale: 1
  },

  render: ({ pressScale, ripple }) => (
    <main className="grid min-w-[42rem] gap-10 bg-background p-12 text-foreground">
      <section className="grid gap-4">
        <h2 className="text-sm font-medium">Variants</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button pressScale={pressScale} ripple={ripple} variant="primary">
            Primary
          </Button>
          <Button pressScale={pressScale} ripple={ripple} variant="secondary">
            Secondary
          </Button>
          <Button pressScale={pressScale} ripple={ripple} variant="outline">
            Outline
          </Button>
          <Button pressScale={pressScale} ripple={ripple} variant="ghost">
            Ghost
          </Button>
          <Button disabled pressScale={pressScale} ripple={ripple}>
            Disabled
          </Button>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-sm font-medium">Geist colors</h2>
        <div className="flex flex-wrap items-center gap-3">
          {GEIST_COLORS.map(({ label, surface, text }) => (
            <div key={label} style={geistButtonStyle(surface, text)}>
              <Button pressScale={pressScale} ripple={ripple}>
                {label}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-sm font-medium">Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button pressScale={pressScale} ripple={ripple} size="sm">
            Small
          </Button>
          <Button pressScale={pressScale} ripple={ripple} size="md">
            Medium
          </Button>
          <Button pressScale={pressScale} ripple={ripple} size="lg">
            Large
          </Button>
          <Button
            aria-label="Add"
            pressScale={pressScale}
            ripple={ripple}
            size="icon"
          >
            +
          </Button>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Click any enabled button to test its ripple. Adjust ripple and press scale in Controls.
      </p>
    </main>
  )
};
