"use client";

import { animate, MotionConfig, motion, useReducedMotion } from "motion/react";
import { type Ref, useEffect, useId, useRef, useState } from "react";
import { cn } from "#lib/utils";

const THUMB_SPRING = {
  type: "spring",
  stiffness: 800,
  damping: 80,
  mass: 4,
} as const;

const SWITCH_SIZE = {
  sm: {
    root: "h-5 w-9 px-0.5",
    thumb: "size-4",
    stretch: "size-4",
    travel: 16,
  },
  md: {
    root: "h-7 w-12 px-1",
    thumb: "size-5",
    stretch: "size-5",
    travel: 20,
  },
} as const;

export interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  interactive?: boolean;
  label?: string;
  size?: keyof typeof SWITCH_SIZE;
  tone?: "accent" | "primary";
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  interactive = true,
  label,
  size = "md",
  tone = "accent",
  className,
}: SwitchProps) {
  const id = useId();
  const thumbRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const sizeClass = SWITCH_SIZE[size];

  useEffect(() => {
    if (!thumbRef.current || reduce) {
      return;
    }

    if (disabled && isPressed) {
      animate(
        thumbRef.current,
        { x: [0, -2, 2, -1, 0] },
        { delay: 0.2, duration: 0.6 },
      );
    }
  }, [disabled, isPressed, reduce]);

  const squish = !disabled && isPointer && isPressed && !reduce;

  return (
    <MotionConfig transition={reduce ? { duration: 0 } : THUMB_SPRING}>
      <span className={cn("inline-flex items-center gap-3", className)}>
        {interactive ? (
          <motion.button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange?.(!checked)}
            onPointerDown={(event) => {
              setIsPressed(true);
              setIsPointer(event.type.startsWith("pointer"));
            }}
            onPointerUp={() => setIsPressed(false)}
            onPointerLeave={() => setIsPressed(false)}
            initial={false}
            data-state={checked ? "checked" : "unchecked"}
            className={cn(
              "group peer inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-60",
              checked
                ? tone === "primary"
                  ? "bg-primary"
                  : "bg-accent"
                : "bg-foreground/15",
              sizeClass.root,
            )}
          >
            <SwitchThumb
              thumbRef={thumbRef}
              checked={checked}
              squish={squish}
              travel={sizeClass.travel}
              thumbClassName={sizeClass.thumb}
              stretchClassName={sizeClass.stretch}
              tone={tone}
            />
          </motion.button>
        ) : (
          <motion.span
            aria-hidden="true"
            initial={false}
            data-state={checked ? "checked" : "unchecked"}
            className={cn(
              "group inline-flex shrink-0 items-center rounded-full transition-colors duration-200",
              checked
                ? tone === "primary"
                  ? "bg-primary"
                  : "bg-accent"
                : "bg-foreground/15",
              sizeClass.root,
            )}
          >
            <SwitchThumb
              thumbRef={thumbRef}
              checked={checked}
              squish={false}
              travel={sizeClass.travel}
              thumbClassName={sizeClass.thumb}
              stretchClassName={sizeClass.stretch}
              tone={tone}
            />
          </motion.span>
        )}
        {label ? (
          <label
            htmlFor={id}
            className="cursor-pointer text-foreground text-sm"
          >
            {label}
          </label>
        ) : null}
      </span>
    </MotionConfig>
  );
}

function SwitchThumb({
  thumbRef,
  checked,
  squish,
  travel,
  thumbClassName,
  stretchClassName,
  tone,
}: {
  thumbRef: Ref<HTMLDivElement>;
  checked: boolean;
  squish: boolean;
  travel: number;
  thumbClassName: string;
  stretchClassName: string;
  tone: "accent" | "primary";
}) {
  return (
    <motion.div
      ref={thumbRef}
      animate={{
        scale: squish ? 0.9 : 1,
        x: checked ? travel : 0,
      }}
      className={cn(
        "pointer-events-none block rounded-full shadow-sm",
        checked && tone === "primary"
          ? "bg-primary-foreground"
          : "bg-background",
        thumbClassName,
      )}
    >
      <div
        className={cn(stretchClassName, squish && (checked ? "ml-1" : "mr-1"))}
      />
    </motion.div>
  );
}
