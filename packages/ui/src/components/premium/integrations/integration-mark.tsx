import { cn } from "../../../lib/utils";
import type { IntegrationItem } from "./integration-data";

export function IntegrationMark({
  integration,
  className,
}: {
  integration: IntegrationItem;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl border border-border/60 bg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        style={{ backgroundImage: `url("${integration.logoUrl}")` }}
        className={cn(
          "size-[46%] bg-center bg-contain bg-no-repeat",
          integration.logoMode !== "color" && "brightness-0 dark:invert",
        )}
      />
    </span>
  );
}
