"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, SPRING_PANEL } from "#lib/ease";
import { cn } from "#lib/utils";

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

export type AnimatedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
  viewportClassName?: string;
  panelClassName?: string;
};

export function AnimatedModal({
  open,
  onOpenChange,
  children,
  className,
  backdropClassName,
  viewportClassName,
  panelClassName,
}: AnimatedModalProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <Dialog
          key="animated-modal"
          open
          onClose={() => onOpenChange(false)}
          className={cn("relative z-[100]", className)}
        >
          <MotionBackdrop
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: reduce
                ? { duration: 0 }
                : { duration: 0.15, ease: EASE_OUT },
            }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }
            }
            className={cn(
              "fixed inset-0 bg-foreground/10 backdrop-blur-xl",
              backdropClassName,
            )}
          />

          <div
            className={cn(
              "fixed inset-0 z-[101] w-screen overflow-x-hidden overflow-y-auto p-4",
              viewportClassName,
            )}
          >
            <div className="flex min-h-full items-center justify-center">
              <MotionPanel
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: reduce ? 0 : 6,
                  scale: reduce ? 1 : 0.96,
                  transition: reduce
                    ? { duration: 0 }
                    : { duration: 0.15, ease: EASE_OUT },
                }}
                transition={reduce ? { duration: 0 } : SPRING_PANEL}
                className={cn(
                  "max-h-[calc(100dvh-2rem)] w-full overflow-y-auto bg-background text-foreground will-change-transform",
                  panelClassName,
                )}
              >
                {children}
              </MotionPanel>
            </div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}

export const AnimatedModalTitle = DialogTitle;
export const AnimatedModalDescription = DialogDescription;
