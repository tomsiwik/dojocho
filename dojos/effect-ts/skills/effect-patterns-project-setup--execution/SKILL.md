---
name: effect-patterns-project-setup-and-execution
description: "Effect-TS patterns for project setup and program execution. Use when initializing Effect projects, running synchronous effects with runSync, running asynchronous effects with runPromise, or creating reusable runtimes from layers."
---

# Effect-TS Patterns: Project Setup & Execution

This skill provides 4 curated Effect-TS patterns for project setup and execution.

Use this skill when working on tasks related to:
- Setting up new Effect-TS projects with TypeScript
- Running synchronous and asynchronous effects
- Creating reusable runtimes for long-running applications

## Workflow

1. **Set up project** — Initialize with TypeScript strict mode and install `effect`
2. **Choose runner** — Use `runSync` for synchronous effects, `runPromise` for async
3. **Scale up** — Create a reusable `Runtime` from layers for server/long-running apps

---

## Beginner Patterns

### Set Up a New Effect Project

**Rule:** Initialize a TypeScript project with strict mode and the `effect` package for maximum type safety.

**Good Example:**

```typescript
// 1. npm init -y
// 2. npm install effect
// 3. npm install -D typescript tsx
// 4. Create tsconfig.json with "strict": true
// 5. Create src/index.ts:
import { Effect } from "effect";

const program = Effect.log("Hello, World!");

Effect.runSync(program);
// 6. Run: npx tsx src/index.ts
```

**Anti-Pattern:** Do not disable `strict` mode in `tsconfig.json`. Running with `"strict": false` removes the type-safety guarantees that make Effect powerful.

---

### Execute Synchronous Effects with Effect.runSync

**Rule:** Use `Effect.runSync` to execute effects that contain no asynchronous operations. Returns the success value directly or throws the error.

**Good Example:**

```typescript
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const n = 10;
  const result = n * 2;
  yield* Effect.log(`Result: ${result}`);
  return result;
});

Effect.runSync(program);
```

**Anti-Pattern:** Do not use `runSync` on effects containing asynchronous operations like `Effect.delay` or `Effect.promise` — this throws a runtime error. Use `runPromise` instead.

---

### Execute Asynchronous Effects with Effect.runPromise

**Rule:** Use `Effect.runPromise` to execute effects that may be asynchronous. Call it only at the outermost layer of your application.

**Good Example:**

```typescript
import { Effect } from "effect";

const program = Effect.succeed("Hello, World!").pipe(
  Effect.delay("1 second")
);

Effect.runPromise(program);
```

**Anti-Pattern:** Never call `runPromise` inside another Effect composition. Effects should be composed together before being run once at the application boundary.

---

## Advanced Patterns

### Create a Reusable Runtime from Layers

**Rule:** For long-running applications (e.g., web servers), compile layers into a `Runtime` once to avoid rebuilding the dependency graph on every execution.

**Good Example:**

```typescript
import { Effect, Layer, Runtime } from "effect";

class GreeterService extends Effect.Service<GreeterService>()("Greeter", {
  sync: () => ({
    greet: (name: string) => Effect.sync(() => `Hello ${name}`),
  }),
}) {}

const runtime = Effect.runSync(
  Layer.toRuntime(GreeterService.Default).pipe(Effect.scoped)
);

// Reuse `runtime` for every request in a server
Runtime.runPromise(runtime)(Effect.log("Hello"));
```

**Anti-Pattern:** Do not provide layers and run effects in a single operation for long-running apps — this forces Effect to rebuild the dependency graph on every execution.
