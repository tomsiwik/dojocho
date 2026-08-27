"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { Silk } from "../auth/silk";
import { HERO_HEADING_CLASS } from "./hero-heading";

export type HeroCenteredDemoProps = {
  promo?: string;
  title?: ReactNode;
  subtext?: ReactNode;
  actions?: ReactNode;
  demo?: ReactNode;
  demoClassName?: string;
  className?: string;
};

export function HeroCenteredDemo({
  promo = "A better way to work",
  title = "Everything you need, in one place.",
  subtext,
  actions,
  demo,
  demoClassName,
  className,
}: HeroCenteredDemoProps) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => reduce
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT, delay },
      };

  return (
    <section className={cn("relative isolate w-full overflow-hidden pt-16 sm:pt-20", className)}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-8">
        <motion.span
          {...rise(0)}
          className="inline-flex items-center gap-2 font-display text-xs font-medium text-muted-foreground uppercase tracking-[0.14em]"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {promo}
        </motion.span>

        <motion.h1 {...rise(0.06)} className={cn(HERO_HEADING_CLASS, "mt-7 text-foreground")}>
          {title}
        </motion.h1>

        {subtext ? (
          <motion.p {...rise(0.12)} className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground leading-7">
            {subtext}
          </motion.p>
        ) : null}

        {actions ? <motion.div {...rise(0.18)} className="mx-auto mt-7 flex justify-center">{actions}</motion.div> : null}
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 36 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={reduce ? undefined : { duration: 0.7, ease: EASE_OUT, delay: 0.22 }}
        className="relative mt-14 h-[34rem] overflow-hidden border-border border-t [border-top-style:dashed] sm:h-[40rem]"
      >
        <Silk
          className="absolute inset-0"
          color="#ff0056"
          noiseIntensity={1.4}
          rotation={(3 * Math.PI) / 4}
          scale={1.15}
          speed={4}
        />
        <div className={cn("relative h-full p-5 sm:p-8 lg:p-12", demoClassName)}>{demo}</div>
      </motion.div>
    </section>
  );
}
