"use client";

import { ArrowLeftRight, Boxes, Check, CircleHelp, X } from "lucide-react";
import {
  AnimatedModal,
  AnimatedModalDescription,
  AnimatedModalTitle,
} from "#components/motion/animated-modal";
import { Button } from "#components/motion/button/base";
import type { IntegrationItem } from "./integration-data";
import { IntegrationMark } from "./integration-mark";

const ACCESS_ITEMS = [
  "Access basic workspace information and details",
  "Read activity from connected projects",
  "Create and update connected records",
  "Keep access limited to your team",
] as const;

export function IntegrationConnectDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: IntegrationItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const managing = Boolean(integration.installed);
  const workspaceName = "Untitled";

  return (
    <AnimatedModal
      open={open}
      onOpenChange={onOpenChange}
      backdropClassName="bg-foreground/5 backdrop-blur-xs"
      panelClassName="relative max-w-lg overflow-hidden rounded-[1.75rem] bg-background/95 backdrop-blur-2xl"
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close connection dialog"
        onClick={() => onOpenChange(false)}
        className="absolute top-3.5 right-3.5 z-10 size-9 rounded-xl bg-muted/70 text-muted-foreground hover:text-foreground sm:top-4 sm:right-4"
      >
        <X className="size-4" />
      </Button>

      <div className="border-border/60 border-b px-5 pt-7 pb-6 text-center sm:px-8 sm:pt-8">
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-foreground sm:size-14 sm:rounded-2xl">
            <Boxes className="size-5 sm:size-6" />
          </span>
          <span className="grid size-5 place-items-center text-muted-foreground">
            <ArrowLeftRight className="size-4" />
          </span>
          <IntegrationMark
            integration={integration}
            className="size-12 rounded-xl border-transparent bg-muted sm:size-14 sm:rounded-2xl"
          />
        </div>

        <AnimatedModalTitle className="mt-4 text-balance font-semibold text-xl tracking-[-0.04em] sm:text-2xl">
          {managing
            ? `Manage ${integration.name} access`
            : `Connect ${workspaceName} to ${integration.name}`}
        </AnimatedModalTitle>
        <AnimatedModalDescription className="mx-auto mt-1.5 max-w-sm text-pretty text-muted-foreground text-sm leading-5">
          {integration.description}
        </AnimatedModalDescription>
      </div>

      <div className="px-5 py-5 sm:px-8 sm:py-6">
        <h3 className="font-semibold text-sm">{workspaceName} would like to</h3>

        <div className="mt-4 space-y-3">
          {ACCESS_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted">
                <Check className="size-3 text-muted-foreground" />
              </span>
              <span className="leading-5">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-border/60 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Button variant="secondary">
          <CircleHelp className="size-4" />
          How it works
        </Button>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {managing ? "Save access" : "Allow access"}
          </Button>
        </div>
      </div>
    </AnimatedModal>
  );
}
