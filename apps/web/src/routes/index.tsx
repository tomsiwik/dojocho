import { createFileRoute } from "@tanstack/react-router"
import { GithubIcon } from "lucide-react"
import { HeroSection } from "@/components/ui/hero-1"
import { ScriptCopyBtn } from "@/components/ui/script-copy-button"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />

      <section className="mx-auto max-w-2xl px-6 py-12 space-y-10">
        <div>
          <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Install
          </h2>
          <ScriptCopyBtn
            commandMap={{
              npm: "npm install -g @dojocho/cli",
              pnpm: "pnpm add -g @dojocho/cli",
              bun: "bun add -g @dojocho/cli",
            }}
          />
        </div>

        <div>
          <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Usage
          </h2>
          <pre className="mx-auto max-w-md overflow-x-auto rounded-md border border-border bg-background p-4 font-mono text-sm text-foreground leading-relaxed">
            <span>dojo --start</span>          <span className="text-muted-foreground"># set up your dojo</span>{"\n"}
            <span>dojo add effect-ts</span>    <span className="text-muted-foreground"># add a training pack</span>{"\n"}
{"\n"}
            <span>claude /kata</span>          <span className="text-muted-foreground"># start practicing</span>
          </pre>
        </div>
      </section>

      <footer className="flex items-center justify-center gap-4 py-12">
        <a
          href="https://github.com/tomsiwik/dojocho"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-foreground transition-opacity hover:opacity-70"
        >
          <GithubIcon className="size-5" />
        </a>
        <img
          src="/avatar.jpg"
          alt=""
          className="size-8 rounded-full"
        />
        <a
          href="https://x.com/tomhacks"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="text-foreground transition-opacity hover:opacity-70"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </footer>
    </main>
  )
}
