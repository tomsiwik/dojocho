---
name: effect-patterns-value-handling
description: "Effect-TS Option type patterns for safe value handling. Use when replacing null/undefined with type-safe Option, pattern matching with Option.match, chaining operations with map/flatMap, or building fallback chains with orElse."
---

# Effect-TS Patterns: Value Handling

This skill provides 2 curated Effect-TS patterns for value handling with the Option type.

Use this skill when working on tasks related to:
- Replacing null/undefined with type-safe Option values
- Pattern matching, transforming, and chaining optional values
- Building fallback chains and composing Option pipelines

## Workflow

1. **Wrap values** — Use `Option.some()` / `Option.none()` / `Option.fromNullable()` instead of null/undefined
2. **Transform** — Use `map` to transform, `flatMap` to chain operations returning Option
3. **Extract** — Use `match` for exhaustive handling, `getOrElse` for defaults, `orElse` for fallbacks

---

## Intermediate Patterns

### Handling None and Some Values

**Rule:** Use Option to represent values that may not exist, replacing null/undefined with type-safe Option that forces explicit handling.

**Good Example:**

```typescript
import { Effect, Option } from "effect";

const program = Effect.gen(function* () {
  // Creating Options
  const someValue = Option.some("data");
  const noneValue: Option.Option<string> = Option.none();

  // From nullable values
  const fromNull = Option.fromNullable(null);       // None
  const fromValue = Option.fromNullable("found");    // Some("found")

  // Pattern matching — handle both cases explicitly
  const userId: Option.Option<string> = Option.some("user-123");
  const message = Option.match(userId, {
    onSome: (id) => `User ID: ${id}`,
    onNone: () => "No user found",
  });
  yield* Effect.log(message);

  // Transform with map
  const email = Option.some("user@example.com");
  const domain = Option.map(email, (e) => e.split("@")[1]);

  // Chain with flatMap
  const findUser = (id: string): Option.Option<{ name: string }> =>
    id === "user-1" ? Option.some({ name: "Alice" }) : Option.none();

  const userName = Option.flatMap(
    Option.some("user-1"),
    (id) => Option.map(findUser(id), (u) => u.name)
  );

  // Default values with getOrElse
  const status = Option.getOrElse(Option.none<string>(), () => "unknown");
  yield* Effect.log(`Status: ${status}`);

  // Filter with predicate
  const age = Option.some(25);
  const isAdult = Option.filter(age, (a) => a >= 18); // Some(25)
});

Effect.runPromise(program);
```

**Rationale:** Option provides null-safe programming: `Some(value)` when present, `None` when absent. Use `Option.match()` for exhaustive handling, `map()`/`flatMap()` for transformation chains, `getOrElse()` for defaults, and `filter()` for conditional values.

---

## Advanced Patterns

### Optional Chaining and Composition

**Rule:** Use Option combinators (map, flatMap, ap, orElse) to compose operations that may fail into readable, maintainable pipelines.

**Good Example:**

```typescript
import { Effect, Option, pipe } from "effect";

interface User { id: string; name: string; email: string }
interface Settings { theme: "light" | "dark"; language: string }

const findUser = (id: string): Option.Option<User> =>
  id === "user-42" ? Option.some({ id, name: "Alice", email: "alice@example.com" }) : Option.none();

const getSettings = (userId: string): Option.Option<Settings> =>
  userId === "user-42" ? Option.some({ theme: "dark", language: "en" }) : Option.none();

const program = Effect.gen(function* () {
  // Chain with pipe: userId → user → settings → theme
  const userTheme = pipe(
    Option.some("user-42"),
    Option.flatMap((id) => findUser(id)),
    Option.flatMap((user) => getSettings(user.id)),
    Option.map((settings) => settings.theme)
  );
  const theme = Option.getOrElse(userTheme, () => "light");
  yield* Effect.log(`Theme: ${theme}`);

  // Chained maps for transformations
  const email = Option.some("alice@example.com");
  const username = pipe(
    email,
    Option.map((e) => e.toLowerCase()),
    Option.map((e) => e.split("@")[0])
  );

  // Fallback chains with orElse
  const getPrimary = (): Option.Option<string> => Option.none();
  const getBackup = (): Option.Option<string> => Option.some("backup@example.com");

  const contactEmail = pipe(
    getPrimary(),
    Option.orElse(() => getBackup()),
    Option.getOrElse(() => "no-email@example.com")
  );
  yield* Effect.log(`Contact: ${contactEmail}`);

  // Combine independent Options with all
  const firstName = Option.some("John");
  const lastName = Option.some("Doe");
  const fullName = Option.map(
    Option.all([firstName, lastName]),
    ([first, last]) => `${first} ${last}`
  );
  yield* Effect.log(`Name: ${Option.getOrElse(fullName, () => "Unknown")}`);
});

Effect.runPromise(program);
```

**Rationale:** Option chaining replaces nested null-check pyramids with clean pipelines. Use `pipe` + `flatMap` for dependent lookups, `orElse` for fallback chains, and `Option.all` to combine multiple independent Options.
