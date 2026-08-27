import { InputCopy } from "@dojofoo/ui/input-copy";
import { Check } from "lucide-react";
import { useState } from "react";
import { AGENT_PROMPT } from "./install-prompt";

const INSTALL_COMMAND = "npx dojofoo install";

export function HeroInstallAction() {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(AGENT_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-stretch gap-2 sm:flex-row sm:items-start">
      <InputCopy
        className="min-w-0 flex-1 border border-dashed border-border bg-background pr-2 pl-3.5 [&_button]:min-h-[38px] [&_button]:rounded-none"
        value={INSTALL_COMMAND}
      />
      <div className="shrink-0">
        <button
          className="group flex min-h-10 w-full items-center justify-between gap-3 bg-primary px-3 text-left text-primary-foreground transition-colors hover:bg-primary/85"
          onClick={copyPrompt}
          type="button"
        >
          <span className="font-display text-[11px] font-medium uppercase leading-none tracking-[0.14em]">
            {copied ? "Copied" : "Copy prompt"}
          </span>
          {copied ? <Check className="size-4" /> : null}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground leading-none">
          Let your agent handle it
        </p>
      </div>
    </div>
  );
}
