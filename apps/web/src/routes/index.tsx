import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">dojocho</h1>
      <p className="mt-4 text-lg text-zinc-400">
        Practice katas in your own dojo.
      </p>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Quick start
        </h2>
        <pre className="mt-3 rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">
          <code>npx dojocho init</code>
        </pre>
      </section>

      <footer className="mt-24 text-sm text-zinc-600">
        <a
          href="https://github.com/tomsiwik/dojocho"
          className="underline hover:text-zinc-400"
        >
          GitHub
        </a>
      </footer>
    </main>
  )
}
