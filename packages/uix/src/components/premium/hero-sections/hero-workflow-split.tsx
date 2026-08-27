"use client";

import {
  Aperture,
  Blocks,
  Box,
  ChevronRight,
  Hexagon,
  Layers,
  LayoutDashboard,
  LibraryBig,
  LineChart,
  PanelLeft,
  Plug,
  RefreshCw,
  Settings,
  Sun,
  Triangle,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ButtonState } from "#components/motion/button/stateful";
import { StatefulButton } from "#components/motion/button/stateful";
import { NumberTicker } from "#components/motion/number-ticker";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { Grainient } from "../feature-sections/grainient";
import { HERO_HEADING_CLASS } from "./hero-heading";

export type HeroWorkflowSplitProps = {
  eyebrow?: string;
  title?: string;
  subtext?: string;
  /** Replaces the default demo-request form with product-specific actions. */
  actions?: ReactNode;
  /** Replace the default dashboard mock in the right visual. */
  dashboard?: ReactNode;
  /** Caption above the trusted-by logo marquee. */
  trustedLabel?: string;
  /** Logos shown in the trusted-by marquee. */
  logos?: {
    name: string;
    icon?: typeof Workflow;
    imageSrc?: string;
  }[];
  className?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGOS: { name: string; icon: typeof Workflow }[] = [
  { name: "Northwind", icon: Layers },
  { name: "Cadenza", icon: Hexagon },
  { name: "Vertex", icon: Aperture },
  { name: "Mosaic", icon: Box },
  { name: "Beacon", icon: Triangle },
  { name: "Relay", icon: Zap },
];

const NAV: { label: string; icon: typeof Workflow; badge?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Agents", icon: Workflow, badge: "12" },
  { label: "Playbooks", icon: LibraryBig },
  { label: "Knowledge", icon: Blocks },
  { label: "Insights", icon: LineChart },
  { label: "Team", icon: Users, badge: "9" },
  { label: "Connections", icon: Plug },
  { label: "Settings", icon: Settings },
];

const RUNS: { name: string; trigger: string; runs: string; tint: string }[] = [
  {
    name: "Refund resolver",
    trigger: "Inbound",
    runs: "9,412",
    tint: "bg-emerald-500",
  },
  {
    name: "Churn watcher",
    trigger: "Schedule",
    runs: "7,980",
    tint: "bg-sky-500",
  },
  {
    name: "Invoice matcher",
    trigger: "Webhook",
    runs: "6,524",
    tint: "bg-amber-500",
  },
  {
    name: "Onboarding guide",
    trigger: "Inbound",
    runs: "5,118",
    tint: "bg-rose-500",
  },
  {
    name: "Renewal nudger",
    trigger: "Schedule",
    runs: "4,307",
    tint: "bg-teal-500",
  },
];

const TEMPLATES: { name: string; meta: string; tint: string }[] = [
  {
    name: "Refund resolver",
    meta: "Updated 1h ago · Inbound",
    tint: "bg-emerald-500",
  },
  {
    name: "Churn watcher",
    meta: "Updated 3h ago · Schedule",
    tint: "bg-sky-500",
  },
];

export function HeroWorkflowSplit({
  eyebrow = "Agentic ops platform",
  title = "Put your back office on autopilot",
  subtext = "Helio lets you design, deploy, and supervise AI agents that handle support, billing, and renewals — connected to your stack and resolving work in minutes.",
  actions,
  dashboard,
  trustedLabel = "Trusted by teams automating support and revenue ops",
  logos = LOGOS,
  className,
}: HeroWorkflowSplitProps) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ButtonState>("idle");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email)) {
      setState("error");
      return;
    }
    setState("loading");
    setTimeout(() => setState("success"), 1100);
  };

  const rise = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: EASE_OUT, delay },
        };

  return (
    <section
      className={cn("w-full overflow-hidden px-4 py-16 sm:px-8", className)}
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
        {/* Copy. */}
        <div className="min-w-0 max-w-xl">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 border border-dashed border-border px-3.5 py-1.5 font-medium text-foreground text-sm"
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            {...rise(0.06)}
            className={cn(HERO_HEADING_CLASS, "mt-6 text-foreground")}
          >
            {title}
          </motion.h1>

          {subtext ? (
            <motion.p
              {...rise(0.12)}
              className="mt-5 max-w-md text-pretty text-base text-muted-foreground leading-7"
            >
              {subtext}
            </motion.p>
          ) : null}

          {actions ? (
            <motion.div {...rise(0.18)} className="mt-8">
              {actions}
            </motion.div>
          ) : (
            <motion.form
              {...rise(0.18)}
              onSubmit={onSubmit}
              className={cn(
                "mt-8 flex w-full max-w-md items-center gap-2 border border-dashed p-1.5 transition-colors",
                state === "error" ? "border-rose-500/60" : "border-border/70",
              )}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="Enter your work email"
                aria-label="Work email"
                aria-invalid={state === "error"}
                className="h-10 min-w-0 flex-1 bg-transparent px-4 text-foreground text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <StatefulButton
                type="submit"
                state={state === "error" ? "idle" : state}
                size="md"
                className="shrink-0 rounded-none"
                loadingText="Sending"
                successText="Requested"
              >
                Request a demo
              </StatefulButton>
            </motion.form>
          )}

          {/* Trusted-by logo marquee. */}
          {trustedLabel || logos.length > 0 ? (
            <motion.div {...rise(0.26)} className="mt-16 lg:mt-24">
              {trustedLabel ? (
                <p className="text-muted-foreground/80 text-xs">{trustedLabel}</p>
              ) : null}
              {logos.length > 0 ? <LogoMarquee reduce={reduce} logos={logos} /> : null}
            </motion.div>
          ) : null}
        </div>

        {/* Dashboard mock over a soft backdrop + grainient illustration strip. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 28 }}
          animate={reduce ? undefined : { opacity: 1, x: 0 }}
          transition={
            reduce ? undefined : { duration: 0.7, ease: EASE_OUT, delay: 0.2 }
          }
          className="relative w-full min-w-0 lg:mr-[calc(50%-50vw)] lg:w-auto"
        >
          <div className="relative overflow-hidden border border-dashed border-border/60">
            {/* Grainient is the container — the dashboard floats inside it. */}
            <Grainient
              className="absolute inset-0"
              color1="#dfe9a6"
              color2="#6fb389"
              color3="#cf9a5c"
              grainAmount={0.1}
              contrast={1.25}
              zoom={0.8}
            />
            {/* Top + left padding lets the grainient peek; bottom is flush so
                the dashboard touches the container edge. */}
            {/* Top + left padding lets the grainient peek; the frame bleeds
                past the right + bottom so the dashboard touches those edges. */}
            <div className="relative overflow-hidden pt-5 pl-8 sm:pt-8 sm:pl-14">
              {/* Outer frosted glass frame. */}
              <div className="-mr-4 bg-background/15 p-1.5 pr-0 pb-0 backdrop-blur-md sm:-mr-6">
                {dashboard ?? <WorkflowDashboard />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LogoMarquee({
  reduce,
  logos = LOGOS,
}: {
  reduce: boolean | null;
  logos?: {
    name: string;
    icon?: typeof Workflow;
    imageSrc?: string;
  }[];
}) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) halfRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || paused) return;
    const half = halfRef.current;
    if (!half) return;
    let next = x.get() - (22 * delta) / 1000;
    if (next <= -half) next += half;
    x.set(next);
  });

  // Repeat enough that each half spans the full width — no gap before the wrap.
  const items = [...logos, ...logos, ...logos, ...logos];

  return (
    <div
      className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_88%,transparent)]"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex w-max">
        <motion.div style={{ x }} className="flex w-max gap-8">
          {items.map((logo, i) => {
            const Icon = logo.icon;
            return (
              <span
                key={`${logo.name}-${i}`}
                className="inline-flex shrink-0 items-center gap-2 font-semibold text-base text-muted-foreground/60"
              >
                {logo.imageSrc ? (
                  // biome-ignore lint/performance/noImgElement: remote brand asset supplied by the template
                  <img
                    src={logo.imageSrc}
                    alt=""
                    aria-hidden
                    className="size-5 rounded-full object-contain"
                  />
                ) : Icon ? (
                  <Icon className="size-5 text-muted-foreground/80" />
                ) : null}
                {logo.name}
              </span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function WorkflowDashboard() {
  return (
    <div className="relative overflow-hidden rounded-tl-2xl border border-border/60 bg-card">
      {/* Top bar. */}
      <div className="flex items-center justify-between border-border/60 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-foreground text-background">
            <Workflow className="size-3" />
          </span>
          <span className="font-semibold text-foreground text-xs">Helio</span>
          <PanelLeft className="size-3.5 text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <LayoutDashboard className="size-3" />
          Dashboard
          <Sun className="size-3.5" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar. */}
        <div className="hidden w-44 shrink-0 flex-col border-border/60 border-r p-2.5 sm:flex">
          <p className="px-2 py-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Workspaces
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV.map((item, i) => {
              const Icon = item.icon;
              const active = i === 0;
              return (
                <span
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs",
                    active
                      ? "bg-foreground/[0.06] font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] text-emerald-600">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>

          {/* Upgrade card + profile. */}
          <div className="mt-auto pt-3">
            <div className="rounded-xl border border-border/60 bg-background p-2.5">
              <p className="text-[10px] text-muted-foreground">
                7,300 / 10,000 resolutions
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[89%] rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 rounded-lg bg-foreground py-1.5 text-center font-medium text-[10px] text-background">
                Upgrade plan
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              {/* biome-ignore lint/performance/noImgElement: small remote SVG avatar */}
              <img
                src="https://api.dicebear.com/10.x/glass/svg?seed=Priya"
                alt=""
                aria-hidden
                className="size-6 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-[11px] text-foreground">
                  Priya Nair
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  priya@helio.ai
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main. */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <h3 className="font-semibold text-foreground text-lg">
            Welcome back, Priya
          </h3>
          <p className="text-muted-foreground text-xs">
            Your agents resolved 1,840 tasks while you were away.
          </p>

          {/* Stat tiles. */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat
              label="Tasks resolved"
              value={18402}
              delta="+18% from last week"
            />
            <Stat
              label="Resolution rate"
              value={96}
              suffix=".4%"
              delta="+1.2% from last week"
            />
          </div>

          {/* Active agents. */}
          <div className="mt-4 rounded-xl border border-border/60">
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="font-medium text-foreground text-xs">
                Active agents
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 pb-1 text-[10px] text-muted-foreground/70 uppercase tracking-wide">
              <span>Agent</span>
              <span className="hidden sm:inline">Source</span>
              <span className="text-right">Resolved</span>
            </div>
            <div className="divide-y divide-border/50">
              {RUNS.map((r) => (
                <div
                  key={r.name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-3 py-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "size-4 shrink-0 rounded-full opacity-80",
                        r.tint,
                      )}
                    />
                    <span className="truncate font-medium text-foreground">
                      {r.name}
                    </span>
                  </span>
                  <span className="hidden text-muted-foreground sm:inline">
                    {r.trigger}
                  </span>
                  <span className="text-right font-mono text-muted-foreground tabular-nums">
                    {r.runs}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent playbooks. */}
          <p className="mt-4 mb-2 font-medium text-foreground text-xs">
            Recent playbooks
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border/60 bg-background p-3"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-white",
                      t.tint,
                    )}
                  >
                    <Blocks className="size-3.5" />
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-px text-[9px] text-emerald-600">
                    Active
                  </span>
                </div>
                <p className="mt-2 truncate font-medium text-[11px] text-foreground">
                  {t.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {t.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  delta,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground text-xl tabular-nums">
        <NumberTicker value={value} locale />
        {suffix}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
        <RefreshCw className="size-2.5" />
        {delta}
      </p>
    </div>
  );
}
