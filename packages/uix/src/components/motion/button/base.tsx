"use client";
// beui.dev/components/motion/button

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import { play } from "cuelume";
import {
  forwardRef,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "~/lib/ease";
import { useHoverCapable } from "~/lib/hooks/use-hover-capable";
import { cn } from "~/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  /** Spawn a Material-style ripple from the press point. Off by default. */
  ripple?: boolean;
  children?: ReactNode;
}

export interface ButtonLinkProps extends Omit<
  HTMLMotionProps<"a">,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  children?: ReactNode;
}

type Ripple = { id: number; x: number; y: number; size: number };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-button-primary-hover",
  secondary: "bg-card text-foreground",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-primary/5",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-primary/5",
};

const DEPTH_CLASS: Partial<Record<ButtonVariant, string>> = {
  primary:
    "bg-button-primary-depth pb-[3px] hover:bg-button-primary-depth",
  secondary: "bg-button-secondary-depth pb-[3px]",
};

const BORDER_SIBLING_CLASS: Partial<Record<ButtonVariant, string>> = {
  primary:
    "button-border-sibling [--button-border-surface:var(--primary)] group-has-[button:disabled]:[--button-border-surface:var(--button-disabled)]",
  secondary:
    "button-border-sibling [--button-border-surface:var(--card)] group-has-[button:disabled]:[--button-border-surface:var(--button-disabled)]",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-8 w-8",
};

const INSET_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-[30px] px-[11px] text-xs gap-1.5",
  md: "h-[38px] px-[19px] text-sm gap-2",
  lg: "h-[46px] px-[23px] text-base gap-2",
  icon: "h-[30px] w-[30px]",
};

const BORDER_SHELL_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  icon: "h-8 w-8",
};

const RADIUS_CLASS: Record<ButtonSize, string> = {
  sm: "rounded-button-sm",
  md: "rounded-button-md",
  lg: "rounded-button-lg",
  icon: "rounded-button-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.98,
      ripple = false,
      className,
      children,
      onPointerDown,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const canHover = useHoverCapable();
    const isDisabled = Boolean(rest.disabled);
    const hasBorderSibling = Boolean(BORDER_SIBLING_CLASS[variant]);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const nextId = useRef(0);

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        play("press", { volume: 0.5 });
        if (ripple && !reduce) {
          const rect = event.currentTarget.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2;
          const id = nextId.current++;
          setRipples((prev) => [
            ...prev,
            {
              id,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              size,
            },
          ]);
        }
        onPointerDown?.(event);
      },
      [ripple, reduce, onPointerDown],
    );

    return (
      <motion.span
        whileTap={reduce || isDisabled ? undefined : { scale: pressScale }}
        whileHover={
          reduce || !canHover || isDisabled ? undefined : { scale: 1.02 }
        }
        transition={SPRING_PRESS}
        className={cn(
          "group relative inline-flex cursor-pointer self-start",
          RADIUS_CLASS[size],
          DEPTH_CLASS[variant] && "pb-[3px]",
        )}
      >
        {DEPTH_CLASS[variant] ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-[3px] bottom-0 group-has-[button:disabled]:bg-button-disabled-depth",
              RADIUS_CLASS[size],
              VARIANT_CLASS[variant],
              DEPTH_CLASS[variant],
              "pb-0",
            )}
          />
        ) : null}
        {hasBorderSibling ? (
          <motion.span
          whileTap={
              reduce || isDisabled ? undefined : { y: 2 }
          }
          transition={SPRING_PRESS}
          className={cn(
              "relative inline-flex",
            BORDER_SHELL_SIZE_CLASS[size],
            RADIUS_CLASS[size],
          )}
        >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0",
                RADIUS_CLASS[size],
                BORDER_SIBLING_CLASS[variant],
              )}
            />
            <motion.button
              ref={ref}
              type="button"
              onPointerDown={handlePointerDown}
              className={cn(
                "relative m-px inline-flex cursor-pointer items-center justify-center font-medium select-none",
                "transition-colors",
                "disabled:pointer-events-none disabled:bg-button-disabled disabled:text-button-disabled-foreground",
                ripple && "overflow-hidden",
                VARIANT_CLASS[variant],
                INSET_SIZE_CLASS[size],
                RADIUS_CLASS[size],
                className,
              )}
              {...rest}
            >
              {ripple && !reduce ? (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <AnimatePresence>
                    {ripples.map((r) => (
                      <motion.span
                        key={r.id}
                        className="absolute rounded-full bg-current"
                        style={{
                          left: r.x,
                          top: r.y,
                          width: r.size,
                          height: r.size,
                          x: "-50%",
                          y: "-50%",
                        }}
                        initial={{ scale: 0.05, opacity: 0.3 }}
                        animate={{ scale: 1, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.6, ease: EASE_OUT }}
                        onAnimationComplete={() =>
                          setRipples((prev) => prev.filter((x) => x.id !== r.id))
                        }
                      />
                    ))}
                  </AnimatePresence>
                </span>
              ) : null}
              {children}
            </motion.button>
          </motion.span>
        ) : (
          <motion.button
            ref={ref}
            type="button"
            whileTap={
              reduce || isDisabled || !DEPTH_CLASS[variant]
                ? undefined
                : { y: 2 }
            }
            transition={SPRING_PRESS}
            onPointerDown={handlePointerDown}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center font-medium select-none",
              "transition-colors",
              "disabled:pointer-events-none disabled:bg-button-disabled disabled:text-button-disabled-foreground",
              ripple && "relative overflow-hidden",
              VARIANT_CLASS[variant],
              SIZE_CLASS[size],
              RADIUS_CLASS[size],
              className,
            )}
            {...rest}
          >
          {ripple && !reduce ? (
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.span
                    key={r.id}
                    className="absolute rounded-full bg-current"
                    style={{
                      left: r.x,
                      top: r.y,
                      width: r.size,
                      height: r.size,
                      x: "-50%",
                      y: "-50%",
                    }}
                    initial={{ scale: 0.05, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, ease: EASE_OUT }}
                    onAnimationComplete={() =>
                      setRipples((prev) => prev.filter((x) => x.id !== r.id))
                    }
                  />
                ))}
              </AnimatePresence>
            </span>
          ) : null}
          {children}
          </motion.button>
        )}
      </motion.span>
    );
  },
);

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.98,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const canHover = useHoverCapable();
    const hasBorderSibling = Boolean(BORDER_SIBLING_CLASS[variant]);

    return (
      <motion.span
        whileTap={reduce ? undefined : { scale: pressScale }}
        whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
        transition={SPRING_PRESS}
        className={cn(
          "relative inline-flex cursor-pointer self-start",
          RADIUS_CLASS[size],
          DEPTH_CLASS[variant] && "pb-[3px]",
        )}
      >
        {DEPTH_CLASS[variant] ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-[3px] bottom-0",
              RADIUS_CLASS[size],
              VARIANT_CLASS[variant],
              DEPTH_CLASS[variant],
              "pb-0",
            )}
          />
        ) : null}
        {hasBorderSibling ? (
          <motion.span
          whileTap={
              reduce ? undefined : { y: 2 }
          }
          transition={SPRING_PRESS}
          className={cn(
              "relative inline-flex",
            BORDER_SHELL_SIZE_CLASS[size],
            RADIUS_CLASS[size],
          )}
        >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0",
                RADIUS_CLASS[size],
                BORDER_SIBLING_CLASS[variant],
              )}
            />
            <motion.a
              ref={ref}
              className={cn(
                "relative m-px inline-flex cursor-pointer items-center justify-center font-medium select-none",
                "transition-colors",
                VARIANT_CLASS[variant],
                INSET_SIZE_CLASS[size],
                RADIUS_CLASS[size],
                className,
              )}
              {...rest}
            >
              {children}
            </motion.a>
          </motion.span>
        ) : (
          <motion.a
            ref={ref}
            whileTap={
              reduce || !DEPTH_CLASS[variant] ? undefined : { y: 2 }
            }
            transition={SPRING_PRESS}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center font-medium select-none",
              "transition-colors",
              VARIANT_CLASS[variant],
              SIZE_CLASS[size],
              RADIUS_CLASS[size],
              className,
            )}
            {...rest}
          >
            {children}
          </motion.a>
        )}
      </motion.span>
    );
  },
);
