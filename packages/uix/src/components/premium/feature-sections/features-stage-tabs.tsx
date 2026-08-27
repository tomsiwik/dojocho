"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChartSpline,
  Check,
  Clock3,
  Inbox,
  MessageSquareText,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ThumbsUp,
  UserRound,
  WandSparkles,
  type Workflow,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  usePageInView,
  useReducedMotion,
} from "motion/react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { EASE_IN_OUT, EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";

export type FeatureStageScene =
  | "workspace"
  | "automation"
  | "insights"
  | "learning";

export type FeatureStageItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  scene?: FeatureStageScene;
  visual?: ReactNode;
};

export type FeaturesStageTabsProps = {
  items?: FeatureStageItem[];
  defaultItemId?: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
};

const DEFAULT_ITEMS: FeatureStageItem[] = [
  {
    id: "workspace",
    label: "Unified workspace",
    title: "Every conversation stays in context",
    description:
      "Bring requests, customer history, and team decisions into one calm workspace.",
    scene: "workspace",
  },
  {
    id: "automation",
    label: "Automated handoffs",
    title: "Routine work moves without chasing",
    description:
      "Route requests, assign owners, and prepare the next step while your team stays focused.",
    scene: "automation",
  },
  {
    id: "insights",
    label: "Live insights",
    title: "See what needs attention now",
    description:
      "Turn every interaction into a clear view of workload, quality, and emerging patterns.",
    scene: "insights",
  },
  {
    id: "learning",
    label: "Always improving",
    title: "The system learns from resolved work",
    description:
      "Capture feedback and approved answers so the next response starts from better context.",
    scene: "learning",
  },
];

const SCENE_BACKDROPS: Record<FeatureStageScene, string> = {
  workspace:
    "bg-[radial-gradient(70%_90%_at_16%_12%,rgb(236_191_142_/_0.72),transparent_64%),radial-gradient(78%_88%_at_86%_82%,rgb(110_166_151_/_0.62),transparent_68%),linear-gradient(145deg,rgb(242_224_198),rgb(205_217_201))]",
  automation:
    "bg-[radial-gradient(75%_88%_at_82%_10%,rgb(244_190_174_/_0.7),transparent_64%),radial-gradient(74%_82%_at_8%_88%,rgb(137_184_177_/_0.58),transparent_68%),linear-gradient(145deg,rgb(238_218_201),rgb(219_211_198))]",
  insights:
    "bg-[radial-gradient(72%_86%_at_18%_8%,rgb(173_205_196_/_0.7),transparent_64%),radial-gradient(78%_88%_at_88%_86%,rgb(232_191_144_/_0.58),transparent_68%),linear-gradient(145deg,rgb(214_226_217),rgb(226_215_194))]",
  learning:
    "bg-[radial-gradient(70%_86%_at_84%_12%,rgb(236_203_151_/_0.66),transparent_64%),radial-gradient(76%_88%_at_12%_86%,rgb(151_192_181_/_0.6),transparent_68%),linear-gradient(145deg,rgb(226_220_198),rgb(205_220_209))]",
};

export function FeaturesStageTabs({
  items = DEFAULT_ITEMS,
  defaultItemId,
  autoPlay = true,
  interval = 6500,
  className,
}: FeaturesStageTabsProps) {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const remainingTimeRef = useRef(interval);
  const timerStartedAtRef = useRef<number | null>(null);
  const isInView = useInView(sectionRef, { margin: "120px" });
  const isPageInView = usePageInView();
  const tabsId = useId();
  const [activeId, setActiveId] = useState(defaultItemId ?? items[0]?.id);

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const active = items[activeIndex] ?? items[0];
  const shouldPlay =
    autoPlay && !reduce && isInView && isPageInView && items.length > 1;
  const progressEnabled = autoPlay && !reduce && items.length > 1;

  useEffect(() => {
    remainingTimeRef.current = interval;
  }, [interval]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeId starts a fresh timer for each slide.
  useEffect(() => {
    if (!shouldPlay) return;

    timerStartedAtRef.current = performance.now();
    const timer = window.setTimeout(() => {
      timerStartedAtRef.current = null;
      remainingTimeRef.current = interval;
      setActiveId((current) => {
        const currentIndex = items.findIndex((item) => item.id === current);
        return items[(currentIndex + 1) % items.length]?.id ?? current;
      });
    }, remainingTimeRef.current);

    return () => {
      window.clearTimeout(timer);
      const startedAt = timerStartedAtRef.current;
      if (startedAt !== null) {
        remainingTimeRef.current = Math.max(
          0,
          remainingTimeRef.current - (performance.now() - startedAt),
        );
        timerStartedAtRef.current = null;
      }
    };
  }, [activeId, interval, items, shouldPlay]);

  useEffect(() => {
    if (!activeId) return;
    const tabList = tabListRef.current;
    const tab = tabRefs.current[activeId];
    if (!tabList || !tab) return;

    tabList.scrollTo({
      left: tab.offsetLeft - (tabList.clientWidth - tab.clientWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeId, reduce]);

  if (!active) return null;

  function activateItem(id: string) {
    remainingTimeRef.current = interval;
    timerStartedAtRef.current = null;
    setActiveId(id);
  }

  function selectIndex(index: number) {
    const next = items[index];
    if (next) activateItem(next.id);
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectIndex(nextIndex);
    const nextTab = event.currentTarget.parentElement?.children[nextIndex] as
      | HTMLButtonElement
      | undefined;
    nextTab?.focus();
  }

  return (
    <section
      ref={sectionRef}
      className={cn("w-full px-3 py-20 sm:px-6", className)}
    >
      <style>{`
        @keyframes beui-feature-stage-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <div className="mx-auto w-full max-w-[88rem] overflow-hidden rounded-xl border border-border bg-background">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Product capabilities"
          className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto border-border border-b"
        >
          {items.map((item, index) => {
            const selected = item.id === active.id;
            const tabId = `${tabsId}-tab-${item.id}`;
            const panelId = `${tabsId}-panel-${item.id}`;

            return (
              <button
                ref={(node) => {
                  tabRefs.current[item.id] = node;
                }}
                key={item.id}
                id={tabId}
                type="button"
                role="tab"
                aria-controls={panelId}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => activateItem(item.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  "relative min-h-12 min-w-[16.5rem] flex-1 snap-center border-border border-r px-6 py-5 text-left outline-none transition-colors last:border-r-0 focus-visible:bg-muted/60 sm:min-w-[20rem] lg:min-w-0",
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                )}
              >
                {selected ? (
                  <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-border">
                    <span
                      className="absolute inset-0 origin-left bg-foreground"
                      style={
                        progressEnabled
                          ? {
                              animationName: "beui-feature-stage-progress",
                              animationDuration: `${interval}ms`,
                              animationTimingFunction: "linear",
                              animationFillMode: "forwards",
                              animationPlayState: shouldPlay
                                ? "running"
                                : "paused",
                            }
                          : { transform: "scaleX(1)" }
                      }
                    />
                  </span>
                ) : null}
                <span className="block whitespace-nowrap font-medium text-base leading-none sm:text-lg">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[36rem] overflow-hidden sm:min-h-[42rem]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={active.id}
              id={`${tabsId}-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-tab-${active.id}`}
              initial={
                reduce
                  ? false
                  : { opacity: 0, scale: 1.012, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.992, filter: "blur(6px)" }
              }
              transition={
                reduce ? { duration: 0 } : { duration: 0.46, ease: EASE_IN_OUT }
              }
              className="absolute inset-0"
            >
              {active.visual ?? (
                <DefaultStage
                  scene={active.scene ?? "workspace"}
                  title={active.title}
                  description={active.description}
                  reduceMotion={reduce}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DefaultStage({
  scene,
  title,
  description,
  reduceMotion,
}: {
  scene: FeatureStageScene;
  title: string;
  description: string;
  reduceMotion: boolean;
}) {
  return (
    <div className={cn("absolute inset-0", SCENE_BACKDROPS[scene])}>
      <div className="absolute inset-0 bg-background/10 dark:bg-background/70" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.42, ease: EASE_OUT, delay: 0.08 }
        }
        className="relative z-10 mx-auto max-w-2xl px-6 pt-10 text-center sm:pt-12"
      >
        <h3 className="text-balance font-medium text-xl text-foreground tracking-tight">
          {title}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-foreground/65 text-sm leading-6 dark:text-foreground/78 sm:text-base">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.58, ease: EASE_OUT, delay: 0.12 }
        }
        className="absolute inset-x-3 top-[11.25rem] bottom-[-3rem] sm:inset-x-[8%] sm:top-[11.5rem] sm:bottom-[-5rem]"
      >
        <ProductFrame>
          {scene === "workspace" ? <WorkspaceScene /> : null}
          {scene === "automation" ? <AutomationScene /> : null}
          {scene === "insights" ? <InsightsScene /> : null}
          {scene === "learning" ? <LearningScene /> : null}
        </ProductFrame>
      </motion.div>
    </div>
  );
}

function ProductFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden rounded-t-2xl border border-border bg-background/95 backdrop-blur-xl">
      <div className="flex h-12 items-center justify-between border-border border-b px-3 sm:h-14 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg border border-border bg-muted text-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="font-medium text-sm text-foreground">
            Relay workspace
          </span>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/45 px-3 py-2 text-muted-foreground text-xs sm:flex">
          <Search className="size-3.5" aria-hidden />
          Search conversations
        </div>
      </div>
      <div className="h-[calc(100%-3rem)] sm:h-[calc(100%-3.5rem)]">
        {children}
      </div>
    </div>
  );
}

function WorkspaceScene() {
  const conversations = [
    ["Aria Flores", "Upgrade request", "Now"],
    ["Northline Labs", "Workspace access", "8m"],
    ["Theo Martin", "Invoice question", "14m"],
    ["Morrow Studio", "Migration planning", "31m"],
  ];

  return (
    <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(0,0.76fr)_minmax(0,1.35fr)] lg:grid-cols-[15rem_minmax(0,1.25fr)_18rem]">
      <div className="hidden border-border border-r bg-muted/25 p-3 sm:block sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-foreground text-sm">Inbox</span>
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
            12 open
          </span>
        </div>
        <div className="space-y-1.5">
          {conversations.map(([name, subject, time], index) => (
            <div
              key={name}
              className={cn(
                "rounded-xl border px-3 py-3",
                index === 0
                  ? "border-border bg-background"
                  : "border-transparent",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-foreground text-xs">
                  {name}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {time}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {subject}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col bg-background">
        <div className="flex h-14 items-center justify-between border-border border-b px-4">
          <div>
            <p className="font-medium text-foreground text-sm">Aria Flores</p>
            <p className="text-[10px] text-muted-foreground">
              Product workspace
            </p>
          </div>
          <span className="rounded-lg border border-border px-2.5 py-1.5 text-foreground text-xs">
            Assign
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 p-4 sm:p-6">
          <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-foreground text-xs leading-5">
            Can you help us move the design team onto the annual workspace?
          </div>
          <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md border border-border bg-card px-4 py-3 text-foreground text-xs leading-5">
            Absolutely. I’ve prepared the workspace change and kept your current
            permissions intact.
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-muted-foreground text-xs">
            <MessageSquareText className="size-4" aria-hidden />
            Write a reply
          </div>
        </div>
      </div>

      <div className="hidden border-border border-l bg-muted/20 p-5 lg:block">
        <p className="font-medium text-foreground text-sm">Customer context</p>
        <dl className="mt-5 space-y-4 text-xs">
          <ContextRow label="Plan" value="Growth" />
          <ContextRow label="Team size" value="24 members" />
          <ContextRow label="Last request" value="12 days ago" />
        </dl>
        <div className="mt-6 rounded-xl border border-border bg-background p-3">
          <p className="flex items-center gap-2 font-medium text-foreground text-xs">
            <BadgeCheck className="size-4" aria-hidden />
            Healthy account
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground leading-5">
            All workspace checks are clear.
          </p>
        </div>
      </div>
    </div>
  );
}

function AutomationScene() {
  const steps = [
    {
      icon: Inbox,
      label: "New request",
      detail: "Account access",
    },
    {
      icon: SlidersHorizontal,
      label: "Match rule",
      detail: "Workspace admin",
    },
    {
      icon: UserRound,
      label: "Assign owner",
      detail: "Customer success",
    },
    {
      icon: Check,
      label: "Prepare action",
      detail: "Access review",
    },
  ];

  return (
    <div className="grid h-full lg:grid-cols-[17rem_1fr]">
      <div className="hidden border-border border-r bg-muted/20 p-5 lg:block">
        <p className="font-medium text-foreground text-sm">Active workflows</p>
        <div className="mt-4 space-y-2">
          {["Access requests", "Plan changes", "Priority routing"].map(
            (workflow, index) => (
              <div
                key={workflow}
                className={cn(
                  "rounded-xl border px-3 py-3 text-xs",
                  index === 0
                    ? "border-border bg-background text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {workflow}
              </div>
            ),
          )}
        </div>
      </div>
      <div className="p-4 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">
              Access request routing
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Moves qualified requests to the right owner
            </p>
          </div>
          <span className="rounded-lg border border-border bg-muted/35 px-2.5 py-1.5 text-foreground text-xs">
            Active
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 md:mt-8 md:grid-cols-4 md:gap-3">
          {steps.map(({ icon: Icon, label, detail }, index) => (
            <div
              key={label}
              className="relative rounded-xl border border-border bg-card p-3 md:p-4"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground md:size-9">
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="mt-3 font-medium text-foreground text-xs md:mt-5 md:text-sm">
                {label}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute top-6 -right-5 z-10 hidden size-4 text-muted-foreground md:block" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-foreground text-xs sm:text-sm">
              <Clock3 className="size-4" aria-hidden />
              Average handoff
            </div>
            <p className="mt-4 font-medium text-2xl text-foreground sm:mt-5 sm:text-3xl">
              18 sec
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Down from 11 minutes
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-foreground text-xs sm:text-sm">
              <ShieldCheck className="size-4" aria-hidden />
              Approval coverage
            </div>
            <p className="mt-4 font-medium text-2xl text-foreground sm:mt-5 sm:text-3xl">
              94%
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Reviewed before action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsScene() {
  const bars = [
    { id: "w01", height: 38 },
    { id: "w02", height: 48 },
    { id: "w03", height: 42 },
    { id: "w04", height: 61 },
    { id: "w05", height: 54 },
    { id: "w06", height: 72 },
    { id: "w07", height: 66 },
    { id: "w08", height: 82 },
    { id: "w09", height: 74 },
    { id: "w10", height: 91 },
    { id: "w11", height: 86 },
    { id: "w12", height: 96 },
  ];

  return (
    <div className="h-full p-4 sm:p-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard label="Resolution rate" value="92%" change="8% higher" />
        <MetricCard label="Median response" value="4m" change="2m faster" />
        <MetricCard
          label="Quality score"
          value="4.8"
          change="Across 1,240 replies"
        />
      </div>

      <div className="mt-2 grid gap-3 sm:mt-3 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                Resolved conversations
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Last 12 weeks
              </p>
            </div>
            <ChartSpline className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="mt-6 flex h-32 items-end gap-1.5 sm:mt-8 sm:h-44 sm:gap-2">
            {bars.map(({ id, height }) => (
              <div
                key={id}
                className="flex h-full flex-1 items-end rounded-sm bg-muted/65"
              >
                <div
                  className="w-full rounded-sm bg-foreground/78"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden rounded-xl border border-border bg-card p-4 sm:p-5 lg:block">
          <p className="font-medium text-foreground text-sm">Needs attention</p>
          <div className="mt-5 space-y-4">
            <InsightRow label="Plan changes" value="18%" />
            <InsightRow label="Team access" value="13%" />
            <InsightRow label="Billing questions" value="9%" />
          </div>
          <div className="mt-6 rounded-xl bg-muted/55 p-3">
            <p className="flex items-center gap-2 font-medium text-foreground text-xs">
              <WandSparkles className="size-4" aria-hidden />
              Suggested action
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground leading-5">
              Add plan-change guidance to the workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningScene() {
  const feedback = [
    ["Plan migration", "Approved answer", "Used 42 times"],
    ["Access recovery", "Policy updated", "Used 31 times"],
    ["Invoice changes", "New example", "Used 18 times"],
  ];

  return (
    <div className="grid h-full gap-0 lg:grid-cols-[1fr_20rem]">
      <div className="p-4 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">
              Knowledge improvements
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Approved outcomes ready for the next conversation
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
            <RefreshCcw className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mt-5 space-y-2 sm:mt-7 sm:space-y-2.5">
          {feedback.map(([title, status, usage]) => (
            <div
              key={title}
              className="grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3 sm:p-4"
            >
              <div>
                <p className="font-medium text-foreground text-sm">{title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {status}
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {usage}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden border-border border-l bg-muted/20 p-5 lg:block">
        <p className="font-medium text-foreground text-sm">Feedback loop</p>
        <div className="mt-5 space-y-3">
          <FeedbackStep
            icon={MessageSquareText}
            label="Conversation resolved"
          />
          <FeedbackStep icon={ThumbsUp} label="Outcome approved" />
          <FeedbackStep icon={Sparkles} label="Guidance improved" />
        </div>
        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <p className="font-medium text-3xl text-foreground">73%</p>
          <p className="mt-1 text-muted-foreground text-xs">
            More requests answered from proven guidance
          </p>
        </div>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p className="mt-3 font-medium text-2xl text-foreground sm:mt-4 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
        {change}
      </p>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/75"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

function FeedbackStep({
  icon: Icon,
  label,
}: {
  icon: typeof Workflow;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-foreground text-xs">{label}</span>
    </div>
  );
}
