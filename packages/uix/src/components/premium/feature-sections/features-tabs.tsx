"use client";

import {
  Bot,
  Check,
  type LucideIcon,
  MousePointerClick,
  Workflow,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { TextReveal } from "#components/motion/text-reveal";
import { EASE_OUT, SPRING_PANEL } from "#lib/ease";
import { cn } from "#lib/utils";

export type FeatureTab = {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  /** Hex accent that themes this feature's panel (never purple). */
  color: string;
  points?: string[];
  /** Illustration shown in the preview panel. */
  image: string;
};

export type FeaturesTabsProps = {
  eyebrow?: string;
  title?: string[];
  tabs?: FeatureTab[];
  defaultTabId?: string;
  className?: string;
};

const DEFAULT_TABS: FeatureTab[] = [
  {
    id: "primitives",
    icon: MousePointerClick,
    label: "Primitives",
    color: "#2563eb",
    title: "Interaction primitives that feel alive",
    description:
      "Buttons, inputs, tabs, and toggles with tuned press, hover, and focus motion — the building blocks of a polished UI.",
    points: ["Spring press feedback", "Shared-layout toggles", "Focus states"],
    image: "/showcase/beui-pro-landing.png",
  },
  {
    id: "agent",
    icon: Bot,
    label: "Agent UI",
    color: "#10b981",
    title: "Surfaces built for AI agents",
    description:
      "Chat composers, streaming responses, thinking states, and tool-call surfaces designed for modern agent apps.",
    points: ["Streaming responses", "Tool-call cards", "Attachments"],
    image: "/showcase/ai-workbench-bg.webp",
  },
  {
    id: "blocks",
    icon: Workflow,
    label: "Blocks",
    color: "#f43f5e",
    title: "Full sections, ready to drop in",
    description:
      "Pricing, hero, footer, and CTA blocks composed from primitives so you ship complete pages, not fragments.",
    points: ["Pricing & CTA", "Hero sections", "Footers"],
    image: "/showcase/beui-pro-landing.png",
  },
  {
    id: "tooling",
    icon: Wrench,
    label: "Tooling",
    color: "#f59e0b",
    title: "Install straight from the CLI",
    description:
      "A private shadcn registry lets you add premium components with one command and keep the source in your repo.",
    points: ["shadcn CLI", "Private namespace", "Own the source"],
    image: "/showcase/ai-workbench-bg.webp",
  },
];

export function FeaturesTabs({
  eyebrow = "How it fits together",
  title = ["One library,", "every layer."],
  tabs = DEFAULT_TABS,
  defaultTabId,
  className,
}: FeaturesTabsProps) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const hoverLayoutId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  // Auto-advance through the tabs; pause on hover / reduced motion. Keyed on
  // activeId so a manual click restarts the timer instead of jumping early.
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeId restarts the interval on manual selection.
  useEffect(() => {
    if (reduce || paused || tabs.length < 2) return;
    const id = setInterval(() => {
      setActiveId((current) => {
        const index = tabs.findIndex((tab) => tab.id === current);
        return tabs[(index + 1) % tabs.length]?.id ?? current;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [reduce, paused, tabs, activeId]);

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  return (
    <section className={cn("w-full px-4 py-20 sm:px-8", className)}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
              {eyebrow}
            </p>
          ) : null}
          <TextReveal
            as="h2"
            text={title}
            split="word"
            blur={10}
            className="mt-5 text-balance font-medium text-4xl text-foreground leading-none tracking-tight"
          />
        </div>

        <div
          className="mt-12 grid gap-6 lg:grid-cols-[17rem_1fr]"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Tab list. */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            role="tablist"
            aria-orientation="vertical"
            onPointerLeave={() => setHoveredId(null)}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = tab.id === active.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(tab.id)}
                  onPointerEnter={() => setHoveredId(tab.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring lg:w-full",
                    selected
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {!selected && hoveredId === tab.id ? (
                    <motion.span
                      layoutId={hoverLayoutId}
                      transition={reduce ? { duration: 0 } : SPRING_PANEL}
                      className="absolute inset-0 rounded-2xl bg-muted/60"
                    />
                  ) : null}
                  {selected ? (
                    <motion.span
                      layoutId={layoutId}
                      transition={reduce ? { duration: 0 } : SPRING_PANEL}
                      className="absolute inset-0 rounded-2xl border border-border/60 bg-card"
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative grid size-9 shrink-0 place-items-center rounded-xl bg-muted transition-colors",
                      selected ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="relative font-medium text-sm">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview panel. */}
          <div className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-border/60">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT }
                }
                className="grid h-full md:grid-cols-2"
              >
                {/* Copy. */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce ? undefined : { duration: 0.4, ease: EASE_OUT }
                  }
                  className="relative flex flex-col justify-center p-7 sm:p-9"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-muted text-foreground">
                    <ActiveIcon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-medium text-foreground text-xl">
                    {active.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-7">
                    {active.description}
                  </p>
                  {active.points?.length ? (
                    <ul className="mt-6 flex flex-col gap-2.5">
                      {active.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2.5 text-foreground text-sm"
                        >
                          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                            <Check className="size-3" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.div>

                {/* Illustration — browser-framed screenshot anchored to the
                    bottom-right corner, large and mostly visible. */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={
                    reduce
                      ? undefined
                      : { duration: 0.5, ease: EASE_OUT, delay: 0.05 }
                  }
                  className="relative hidden overflow-hidden md:block"
                >
                  <div className="absolute top-9 right-0 bottom-0 left-9 translate-x-8">
                    <div className="h-full overflow-hidden rounded-tl-2xl border border-border/60 border-r-0 border-b-0 bg-card shadow-[0_40px_80px_-52px_color-mix(in_oklch,var(--foreground)_75%,transparent)]">
                      <div className="flex items-center gap-1.5 border-border/60 border-b bg-muted/40 px-3.5 py-2.5">
                        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                      </div>
                      {/* biome-ignore lint/performance/noImgElement: distributed component stays portable — no next/image host config required. */}
                      <img
                        src={active.image}
                        alt={active.title}
                        className="size-full object-cover object-left-top"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
