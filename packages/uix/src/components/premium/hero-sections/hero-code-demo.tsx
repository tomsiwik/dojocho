"use client";

import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ButtonLink } from "#components/motion/button/base";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { Grainient } from "../feature-sections/grainient";
import { HERO_HEADING_CLASS } from "./hero-heading";

export type HeroCodeDemoProps = {
  promoLabel?: string;
  promo?: string;
  title?: string[];
  subtext?: string;
  actions?: ReactNode;
  demo?: ReactNode;
  className?: string;
};

// Syntax hues that read on the dark glass terminal.
const C = {
  mut: "text-white/40",
  cmd: "text-white",
  url: "text-sky-300",
  flag: "text-amber-300",
  str: "text-emerald-300",
  key: "text-sky-300",
  num: "text-orange-300",
};

const REQUEST: ReactNode[] = [
  <span key="c" className={C.mut}>
    # Drop-in replacement for the OpenAI API. Bring any model.
  </span>,
  <>
    <span className={C.mut}>$ </span>
    <span className={C.cmd}>curl</span>{" "}
    <span className={C.url}>https://api.atlas.dev/v1/chat/completions</span>{" "}
    <span className={C.mut}>\</span>
  </>,
  <>
    {"  "}
    <span className={C.flag}>-H</span>{" "}
    <span className={C.str}>"Authorization: Bearer $ATLAS_KEY"</span>{" "}
    <span className={C.mut}>\</span>
  </>,
  <>
    {"  "}
    <span className={C.flag}>-H</span>{" "}
    <span className={C.str}>"Content-Type: application/json"</span>{" "}
    <span className={C.mut}>\</span>
  </>,
  <>
    {"  "}
    <span className={C.flag}>-d</span> <span className={C.mut}>'{"{"}</span>
  </>,
  <>
    {"    "}
    <span className={C.key}>"model"</span>
    <span className={C.mut}>: </span>
    <span className={C.str}>"llama-3.1-70b"</span>
    <span className={C.mut}>,</span>
  </>,
  <>
    {"    "}
    <span className={C.key}>"messages"</span>
    <span className={C.mut}>: [{"{"}</span>
    <span className={C.key}>"role"</span>
    <span className={C.mut}>:</span>
    <span className={C.str}>"user"</span>
    <span className={C.mut}>,</span>
    <span className={C.key}>"content"</span>
    <span className={C.mut}>:</span>
    <span className={C.str}>"hi"</span>
    <span className={C.mut}>{"}],"}</span>
  </>,
  <>
    {"    "}
    <span className={C.key}>"adaptive"</span>
    <span className={C.mut}>: </span>
    <span className={C.num}>true</span>
  </>,
  <>
    {"  "}
    <span className={C.mut}>{"}'"}</span>
  </>,
];

const RESPONSE: ReactNode[] = [
  <span key="o" className={C.mut}>
    {"{"}
  </span>,
  <>
    {"  "}
    <span className={C.key}>"id"</span>
    <span className={C.mut}>: </span>
    <span className={C.str}>"infr_8f2a…"</span>
    <span className={C.mut}>,</span>
  </>,
  <>
    {"  "}
    <span className={C.key}>"choices"</span>
    <span className={C.mut}>: [{"{ "}</span>
    <span className={C.key}>"message"</span>
    <span className={C.mut}>: {"{ "}</span>
    <span className={C.key}>"content"</span>
    <span className={C.mut}>: </span>
    <span className={C.str}>"Hi there 👋"</span>
    <span className={C.mut}>{" }}],"}</span>
  </>,
  <>
    {"  "}
    <span className={C.key}>"adaptive_score"</span>
    <span className={C.mut}>: </span>
    <span className={C.num}>0.94</span>
  </>,
  <span key="cl" className={C.mut}>
    {"}"}
  </span>,
];

function useReplay(still: boolean, duration: number) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setCycle((c) => c + 1), duration);
    return () => clearInterval(id);
  }, [still, duration]);
  return cycle;
}

export function HeroCodeDemo({
  promoLabel = "New",
  promo = "Free fine-tuning in beta",
  title = ["Inference that adapts to your traffic autonomously"],
  subtext = "One request away from production-grade inference. Atlas watches where your model struggles, then quietly retrains on your own data — no MLOps team required.",
  actions,
  demo,
  className,
}: HeroCodeDemoProps) {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: EASE_OUT, delay },
        };

  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      {/* Top content. */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-8 sm:pt-20">
        <motion.div
          {...rise(0)}
          className="inline-flex max-w-full items-center gap-2 whitespace-nowrap border border-dashed border-border/60 bg-card py-1.5 pr-4 pl-1.5 font-medium text-muted-foreground text-xs sm:text-sm"
        >
          <span className="shrink-0 bg-primary/15 px-2 py-0.5 text-primary text-xs">
            {promoLabel}
          </span>
          <span className="truncate">{promo}</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
        </motion.div>

        <div className="mt-8 grid items-start gap-x-10 gap-y-6 lg:grid-cols-2">
          <motion.h1
            {...rise(0.06)}
            className={cn(HERO_HEADING_CLASS, "text-foreground")}
          >
            {/*{title.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < title.length - 1 ? (
                  <br className="hidden sm:block" />
                ) : null}
              </span>
            ))}*/}
            {title}
          </motion.h1>

          <div className="lg:pt-2">
            {subtext ? (
              <motion.p
                {...rise(0.12)}
                className="max-w-md text-pretty text-base text-muted-foreground leading-7"
              >
                {subtext}
              </motion.p>
            ) : null}
            {actions ? (
              <motion.div {...rise(0.18)} className="mt-6">{actions}</motion.div>
            ) : (
              <motion.div {...rise(0.18)} className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <ButtonLink href="/" size="lg" className="rounded-none bg-orange-500 text-white hover:bg-orange-600">
                  Start free — $0 to first token
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/" variant="secondary" size="lg" className="rounded-none">Get a demo</ButtonLink>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Demo stage: scenic backdrop + floating glass terminal. */}
      <Terminal demo={demo} reduce={reduce} rise={rise} />
    </section>
  );
}

function Terminal({
  demo,
  reduce,
  rise,
}: {
  demo?: ReactNode;
  reduce: boolean | null;
  // biome-ignore lint/suspicious/noExplicitAny: motion prop bag passthrough
  rise: (delay: number) => any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const still = !!reduce || !inView;
  const cycle = useReplay(still, 6400);

  const stream = (delay: number) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: EASE_OUT, delay },
        };

  return (
    <div
      ref={ref}
      className="mx-auto mt-12 w-full sm:mt-16"
    >
      {/* Contained, rounded demo box — edges align with the title above. */}
      <div className="relative h-[34rem] overflow-hidden border-y border-dashed border-border/60 sm:h-[40rem]">
        {/* Soft orange grainient backdrop. */}
        <Grainient
          className="absolute inset-0"
          color1="#fde4c4"
          color2="#f6a86a"
          color3="#e0824a"
          grainAmount={0.09}
          contrast={1.2}
          zoom={0.85}
        />

        {demo ? (
          <motion.div {...rise(0.24)} className="relative h-full p-5 sm:p-8 lg:p-12">
            {demo}
          </motion.div>
        ) : (
        <div className="relative flex justify-center px-4 pt-12 sm:pt-20">
          {/* Frosted glass outer frame. */}
          <motion.div
            {...rise(0.24)}
            className="w-full max-w-2xl bg-white/15 p-1.5 pb-0 shadow-2xl ring-1 ring-white/40 backdrop-blur-md"
          >
            <div className="overflow-hidden border border-white/10 bg-neutral-900/60 backdrop-blur-xl">
              <div className="flex items-center gap-1.5 border-white/10 border-b px-4 py-3">
                <span className="size-3 rounded-full bg-red-400/80" />
                <span className="size-3 rounded-full bg-amber-400/80" />
                <span className="size-3 rounded-full bg-emerald-400/80" />
              </div>

              <div className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
                {/* Request. */}
                {REQUEST.map((line, i) => (
                  <motion.div
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed code lines
                    key={i}
                    {...rise(0.3 + i * 0.05)}
                    className="whitespace-pre text-white/80"
                  >
                    {line}
                  </motion.div>
                ))}

                {/* Status. */}
                <motion.div
                  {...rise(0.3 + REQUEST.length * 0.05)}
                  className="mt-3 flex items-center gap-5 text-xs"
                >
                  <span className="font-medium text-emerald-400">✓ 200 OK</span>
                  <span className={C.mut}>118ms</span>
                  <span className={C.mut}>tokens=18</span>
                </motion.div>

                <div className="my-3 h-px bg-white/10" />

                {/* Response — streams in on a loop. */}
                <motion.div key={`res-${cycle}`} className="whitespace-pre">
                  {RESPONSE.map((line, i) => (
                    <motion.div
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed code lines
                      key={i}
                      {...stream(0.15 + i * 0.18)}
                      className="text-white/80"
                    >
                      {line}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}
