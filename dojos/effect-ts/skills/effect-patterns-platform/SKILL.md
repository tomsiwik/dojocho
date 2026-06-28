---
name: effect-patterns-platform
description: "Effect-TS platform module patterns for filesystem operations, shell command execution, terminal I/O, key-value storage, and cross-platform path handling. Use when building CLI tools, managing files, executing shell commands, or working with persistent storage using @effect/platform."
---

# Effect-TS Patterns: Platform

This skill provides 6 curated Effect-TS patterns for the `@effect/platform` module.

Use this skill when working on tasks related to:
- Filesystem read/write operations with resource safety
- Executing and capturing shell commands
- Building interactive CLI applications with Terminal
- Persistent key-value storage
- Cross-platform path manipulation

## Workflow

1. **Choose the right module** — FileSystem for files, Command for shell, Terminal for CLI I/O, KeyValueStore for persistence
2. **Use Effect composition** — All platform operations return Effects for type-safe error handling
3. **Leverage resource safety** — Platform modules handle cleanup automatically via scopes

---

## Beginner Patterns

### Execute Shell Commands with Command

**Rule:** Use `Command` to spawn and manage external processes, capturing output and handling exit codes reliably.

**Good Example:**

```typescript
import { Command, Effect, Chunk } from "@effect/platform";

const program = Effect.gen(function* () {
  // Capture output as string
  const result = yield* Command.make("ls", ["-la"]).pipe(Command.string);
  console.log(result);

  // Capture output as lines
  const lines = yield* Command.make("find", [".", "-name", "*.ts", "-type", "f"]).pipe(
    Command.lines
  );
  const first5 = Chunk.take(lines, 5);
  Chunk.forEach(first5, (file) => console.log(`  - ${file}`));

  // Handle exit codes
  const exitCode = yield* Command.make("test", ["-f", "/etc/passwd"]).pipe(
    Command.exitCode,
    Effect.catchAll(() => Effect.succeed(-1))
  );
  console.log(`Exit code: ${exitCode}`);
});
```

**Rationale:** `Command` provides type-safe process execution with automatic output capture, exit code handling, and resource cleanup — avoiding unhandled errors, deadlocks from undrained buffers, and resource leaks.

---

### Filesystem Operations with FileSystem

**Rule:** Use `FileSystem` for safe, resource-managed file operations with proper error handling and cleanup.

**Good Example:**

```typescript
import { FileSystem, Effect } from "@effect/platform";

const program = Effect.gen(function* () {
  // Write a file
  yield* FileSystem.writeFileUtf8("test.txt", "Hello, Effect-TS!");

  // Read it back
  const content = yield* FileSystem.readFileUtf8("test.txt");
  console.log(content);

  // Get file metadata
  const stat = yield* FileSystem.stat("test.txt");
  console.log(`Size: ${stat.size} bytes`);

  // Create directory and list contents
  yield* FileSystem.mkdir("test-dir");
  const entries = yield* FileSystem.readDirectory("test-dir");
  entries.forEach((entry) => console.log(`  - ${entry}`));

  // Cleanup
  yield* FileSystem.remove("test-dir");
  yield* FileSystem.remove("test.txt");
});
```

**Rationale:** `FileSystem` provides automatic resource cleanup, rich error context with file paths, async integration, and cross-platform path handling — avoiding resource leaks and platform-specific bugs.

---

### Interactive Terminal I/O

**Rule:** Use `Terminal` for user input/output in CLI applications, providing proper buffering and cross-platform character encoding.

**Good Example:**

```typescript
import { Terminal, Effect } from "@effect/platform";

const program = Effect.gen(function* () {
  yield* Terminal.writeLine("=== User Setup ===");

  yield* Terminal.write("What is your name? ");
  const name = yield* Terminal.readLine();

  yield* Terminal.write("What is your email? ");
  const email = yield* Terminal.readLine();

  yield* Terminal.writeLine(`\n=== Summary ===`);
  yield* Terminal.writeLine(`Name: ${name}`);
  yield* Terminal.writeLine(`Email: ${email}`);

  yield* Terminal.write("Confirm? (yes/no) ");
  const confirm = yield* Terminal.readLine();

  if (confirm.toLowerCase() === "yes") {
    yield* Terminal.writeLine("Information saved");
  } else {
    yield* Terminal.writeLine("Cancelled");
  }
});
```

**Rationale:** Terminal operations (`readLine`, `readPassword`, `writeLine`, `write`, `clearScreen`) provide buffered I/O safe for concurrent output, proper UTF-8 encoding, and no-echo password input.

---

## Intermediate Patterns

### Persistent Key-Value Storage

**Rule:** Use `KeyValueStore` for simple persistent storage of key-value pairs, enabling lightweight caching and session management.

**Good Example:**

```typescript
import { KeyValueStore, Effect } from "@effect/platform";

const program = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;

  // Store data
  yield* store.set("session:user-123", JSON.stringify({ token: "abc", expiresAt: Date.now() + 3600000 }));

  // Retrieve data
  const stored = yield* store.get("session:user-123");
  if (stored._tag === "Some") {
    console.log(JSON.parse(stored.value));
  }

  // Check existence and remove
  const exists = yield* store.has("session:user-123");
  console.log(`Exists: ${exists}`);
  yield* store.remove("session:user-123");
});
```

**Rationale:** `KeyValueStore` provides transparent persistence with pluggable backends (memory, filesystem, database), a simple `set/get/remove/has/clear` API, and full Effect integration for type-safe, composable storage.

---

### Cross-Platform Path Manipulation

**Rule:** Use platform-aware path utilities (`path.join`, `path.resolve`, `path.normalize`) instead of string concatenation for reliable cross-platform path handling.

**Good Example:**

```typescript
import * as Path from "node:path";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  // Join path segments (handles separators automatically)
  const joined = Path.join("data", "reports", "2024");
  yield* Effect.log(`Joined: ${joined}`);

  // Resolve to absolute path
  const absolute = Path.resolve("./config/settings.json");
  yield* Effect.log(`Absolute: ${absolute}`);

  // Normalize redundant separators
  const normalized = Path.normalize("/home//user///documents");
  yield* Effect.log(`Normalized: ${normalized}`);

  // Parse path components
  const parsed = Path.parse("/home/user/report.pdf");
  yield* Effect.log(`Name: ${parsed.name}, Ext: ${parsed.ext}`);

  // Safe path construction (prevent traversal)
  const userPath = "reports/2024.json";
  const base = "/var/app/data";
  if (!Path.isAbsolute(userPath) && !userPath.includes("..")) {
    const safe = Path.resolve(base, userPath);
    if (safe.startsWith(base)) {
      yield* Effect.log(`Safe path: ${safe}`);
    }
  }
});
```

**Rationale:** String-based path handling causes platform inconsistency (Windows `\` vs Unix `/`), path traversal vulnerabilities, and broken environment variable expansion. Use `path.join()`, `path.resolve()`, and `path.normalize()` for correctness.

---

## Advanced Patterns

### Advanced FileSystem Operations

**Rule:** Use atomic writes and streaming reads for crash-safe file operations and memory-efficient large file handling.

**Good Example:**

```typescript
import { Effect } from "effect";
import * as PromiseFS from "node:fs/promises";

// Atomic write: temp file → fsync → rename (crash-safe)
const atomicWrite = (filePath: string, content: string) =>
  Effect.gen(function* () {
    const tempPath = `${filePath}.tmp`;
    yield* Effect.promise(() => PromiseFS.writeFile(tempPath, content, "utf-8"));
    // fsync to ensure data is on disk
    const fd = yield* Effect.promise(() => PromiseFS.open(tempPath, "r"));
    yield* Effect.promise(() => fd.sync());
    yield* Effect.promise(() => fd.close());
    // Atomic rename
    yield* Effect.promise(() => PromiseFS.rename(tempPath, filePath));
  });

// Usage
const program = Effect.gen(function* () {
  yield* atomicWrite("config.json", JSON.stringify({ key: "value" }));
  const content = yield* Effect.promise(() => PromiseFS.readFile("config.json", "utf-8"));
  yield* Effect.log(`Wrote: ${content}`);
});
```

**Rationale:** Atomic writes (temp file + fsync + rename) prevent file corruption on crashes. Streaming reads with chunked processing keep memory constant regardless of file size. Combine with `Ref` for state tracking and `Stream` for data pipelines.
