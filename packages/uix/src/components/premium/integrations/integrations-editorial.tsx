"use client";

import { ArrowLeftRight, Check, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { AnimatedBadge } from "#components/motion/animated-badge";
import { Button } from "#components/motion/button/base";
import { Tabs, TabsList, TabsTrigger } from "#components/motion/tabs";
import { Switch } from "#components/premium/switch/switch";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { IntegrationConnectDialog } from "./integration-connect-dialog";
import {
  DEFAULT_INTEGRATIONS,
  type IntegrationCategory,
  type IntegrationItem,
} from "./integration-data";
import { IntegrationMark } from "./integration-mark";

const FILTERS = [
  "All",
  "Developer",
  "Communication",
  "Design",
  "Data",
  "Payments",
] as const;

type Filter = "All" | IntegrationCategory;

export type IntegrationsEditorialProps = {
  title?: string;
  description?: string;
  integrations?: readonly IntegrationItem[];
  className?: string;
};

export type EditorialFilterOption = {
  label: string;
  value: string;
};

export type EditorialFilterBarProps = {
  options: readonly EditorialFilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  filterLabel?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  className?: string;
};

export function EditorialFilterBar({
  options,
  value,
  onValueChange,
  query,
  onQueryChange,
  filterLabel = "Filter by category",
  searchLabel = "Search",
  searchPlaceholder = "Search",
  className,
}: EditorialFilterBarProps) {
  return (
    <div className={cn("flex flex-col border-y border-dashed border-border lg:flex-row lg:items-stretch", className)}>
      <Tabs
        className="min-w-0 flex-1 overflow-x-auto"
        onValueChange={onValueChange}
        value={value}
        variant="underline"
      >
        <TabsList aria-label={filterLabel} className="min-w-max border-b-0">
          {options.map((option) => (
            <TabsTrigger
              className="mb-0 min-h-11 border-border border-r [border-right-style:dashed] px-4 pb-1 pt-1 font-display text-xs font-medium uppercase tracking-[0.12em]"
              indicatorClassName="bottom-0"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <label className="relative block w-full border-border border-t [border-top-style:dashed] lg:max-w-xs lg:border-t-0 lg:border-l lg:[border-left-style:dashed]">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full bg-background pr-5 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:bg-muted/30"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
        />
      </label>
    </div>
  );
}

export function IntegrationsEditorial({
  title = "Connect the tools behind your work.",
  description = "Browse integrations, find the right fit, and manage every connection in one place.",
  integrations = DEFAULT_INTEGRATIONS,
  className,
}: IntegrationsEditorialProps) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [connectedIds, setConnectedIds] = useState(
    () =>
      new Set(
        integrations
          .filter((integration) => integration.installed)
          .map((integration) => integration.id),
      ),
  );
  const [dialogIntegration, setDialogIntegration] =
    useState<IntegrationItem | null>(null);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return integrations.filter((integration) => {
      const matchesFilter = filter === "All" || integration.category === filter;
      const matchesQuery =
        !normalized ||
        integration.name.toLowerCase().includes(normalized) ||
        integration.description.toLowerCase().includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [filter, integrations, query]);

  const toggleConnection = (id: string) => {
    setConnectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      className={cn(
        "w-full bg-background px-4 py-16 text-foreground sm:px-8 sm:py-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-medium text-muted-foreground text-sm">
            Integrations
          </p>
          <h2 className="mt-3 text-balance font-semibold text-3xl leading-tight tracking-[-0.045em] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-muted-foreground leading-7">
            {description}
          </p>
        </div>

        <EditorialFilterBar
          className="mt-9"
          filterLabel="Filter integrations by category"
          onQueryChange={setQuery}
          onValueChange={(value) => setFilter(value as Filter)}
          options={FILTERS.map((item) => ({ label: item, value: item }))}
          query={query}
          searchLabel="Search integrations"
          searchPlaceholder="Search integrations"
          value={filter}
        />

        <AnimatePresence mode="wait" initial={false}>
          {visible.length ? (
            <motion.div
              key={filter}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }
              }
              className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((integration) => {
                const connected = connectedIds.has(integration.id);

                return (
                  <article
                    key={integration.id}
                    className="flex min-h-60 flex-col rounded-2xl bg-muted p-2"
                  >
                    <div className="flex min-h-10 items-center gap-2 px-2 pb-2">
                      <h3 className="truncate font-medium text-lg tracking-[-0.025em]">
                        {integration.name}
                      </h3>
                      {connected ? (
                        <AnimatedBadge
                          status="success"
                          size="sm"
                          icon={<Check className="size-3" />}
                          className="ml-auto"
                        >
                          Connected
                        </AnimatedBadge>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col rounded-2xl bg-background p-3">
                      <IntegrationMark
                        integration={integration}
                        className="size-12 rounded-xl"
                      />
                      <p className="mt-4 text-pretty text-muted-foreground text-sm leading-6">
                        {integration.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setDialogIntegration({
                              ...integration,
                              installed: connected,
                            })
                          }
                        >
                          <ArrowLeftRight className="size-3.5" />
                          Configure
                        </Button>

                        <Switch
                          checked={connected}
                          onCheckedChange={() =>
                            toggleConnection(integration.id)
                          }
                          size="sm"
                          tone="primary"
                          label={`${connected ? "Disconnect" : "Connect"} ${integration.name}`}
                          className="[&_label]:sr-only"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {visible.length === 0 ? (
          <div className="mt-7 grid min-h-52 place-items-center rounded-2xl bg-muted p-6 text-center">
            <div>
              <p className="font-medium">No integrations found</p>
              <button
                type="button"
                onClick={() => {
                  setFilter("All");
                  setQuery("");
                }}
                className="mt-2 rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {dialogIntegration ? (
        <IntegrationConnectDialog
          integration={dialogIntegration}
          open
          onOpenChange={(open) => {
            if (!open) setDialogIntegration(null);
          }}
        />
      ) : null}
    </section>
  );
}
