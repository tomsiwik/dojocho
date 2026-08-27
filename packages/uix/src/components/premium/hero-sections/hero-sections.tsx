"use client";

import { ArrowRight, BookOpen, Check, Hash, Search } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "#components/motion/button/base";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { Grainient } from "../feature-sections/grainient";
import { HERO_HEADING_CLASS } from "./hero-heading";

const STEPS = [
  "Generate a fresh key under Settings → API",
  "Sync it into your environment secrets",
  "Revoke the previous key after deploy",
];

const SOURCES = [
  { icon: BookOpen, label: "api-keys.md" },
  { icon: BookOpen, label: "Runbook" },
  { icon: Hash, label: "platform" },
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

export function ProductHeroShowcase() {
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
    <section className="relative isolate w-full overflow-hidden px-4 pt-12 sm:px-8 md:pt-16">
      <div className="mx-auto w-full max-w-4xl">
        {/* Copy. */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 font-medium text-foreground text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)]"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            AI knowledge base
          </motion.span>

          <motion.h2
            {...rise(0.06)}
            className={cn(HERO_HEADING_CLASS, "mt-6 text-foreground")}
          >
            Every answer your team needs, instantly cited
          </motion.h2>

          <motion.p
            {...rise(0.12)}
            className="mx-auto mt-5 max-w-md text-pretty text-base text-muted-foreground leading-7"
          >
            Connect your docs, wikis, and tickets — Atlas answers in plain
            language and links the exact source every time.
          </motion.p>

          <motion.div
            {...rise(0.18)}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <ButtonLink href="/" size="lg" className="rounded-full">
              Get a demo
            </ButtonLink>
            <ButtonLink
              href="/"
              variant="secondary"
              size="lg"
              className="rounded-full"
            >
              Learn more
            </ButtonLink>
          </motion.div>
        </div>

        <KnowledgeDemo reduce={reduce} />
      </div>
    </section>
  );
}

function KnowledgeDemo({ reduce }: { reduce: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const still = !!reduce || !inView;
  const cycle = useReplay(still, 6800);

  const stream = (delay: number) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 8, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.4, ease: EASE_OUT, delay },
        };

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduce ? undefined : { duration: 0.7, ease: EASE_OUT }}
      className="relative mt-14 overflow-hidden rounded-t-3xl border border-border/60"
    >
      <Grainient
        className="absolute inset-0 rounded-t-3xl"
        color1="#a7f3d0"
        color2="#10b981"
        color3="#0d9488"
        grainAmount={0.09}
        contrast={1.2}
        zoom={0.85}
      />

      <div className="relative flex justify-center px-4 pt-12 pb-0 sm:px-10 sm:pt-16">
        {/* Frosted glass frame. */}
        <div className="w-full max-w-xl rounded-t-[1.4rem] bg-white/15 p-1.5 pb-0 shadow-2xl ring-1 ring-white/40 backdrop-blur-md">
          <div className="rounded-t-2xl border border-black/[0.06] bg-white/95 p-5">
            {/* Query bar. */}
            <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
              <Search className="size-4 text-neutral-400" />
              <span className="flex-1 text-neutral-700 text-sm">
                How do I rotate our API keys?
              </span>
              <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white">
                <ArrowRight className="size-3.5" />
              </span>
            </div>

            {/* Answer — streams in on a loop. */}
            <motion.div key={`ans-${cycle}`} className="mt-4">
              <motion.p
                {...stream(0.2)}
                className="text-pretty text-neutral-700 text-sm leading-6"
              >
                Rotate keys without downtime in three steps — your old key keeps
                working until you revoke it.
              </motion.p>

              <div className="mt-3 flex flex-col gap-2">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={s}
                    {...stream(0.5 + i * 0.35)}
                    className="flex items-start gap-2.5 text-neutral-700 text-sm"
                  >
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-2.5" />
                    </span>
                    {s}
                  </motion.div>
                ))}
              </div>

              {/* Sources. */}
              <motion.div
                {...stream(0.5 + STEPS.length * 0.35)}
                className="mt-4 flex flex-wrap items-center gap-2 border-neutral-100 border-t pt-3"
              >
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                  Sources
                </span>
                {SOURCES.map((src) => {
                  const Icon = src.icon;
                  return (
                    <span
                      key={src.label}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                    >
                      <Icon className="size-3" />
                      {src.label}
                    </span>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
