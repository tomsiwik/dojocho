---
name: effect-patterns-streams-sinks
description: "Effect-TS Stream Sink patterns for consuming streams into databases, event logs, message queues, and files. Use when batch-inserting stream records, implementing event sourcing, publishing to message queues, writing stream data to files, or building fallback and retry sink strategies."
---

# Effect-TS Patterns: Stream Sinks

This skill provides 6 curated Effect-TS patterns for consuming streams with Sinks.

Use this skill when working on tasks related to:
- Batch inserting stream records into databases
- Appending stream events to event logs (event sourcing)
- Writing stream lines to files with buffering
- Publishing stream records to message queues
- Implementing fallback sinks for resilience
- Retrying failed stream operations with backoff

## Workflow

1. **Choose a sink pattern** — Batch insert for databases, append for event logs, buffered write for files
2. **Add resilience** — Wrap with fallback sinks or retry logic for production reliability
3. **Run the stream** — Connect stream to sink with `Stream.run(sink)`

---

## Intermediate Patterns

### Batch Insert Stream Records into Database

**Rule:** Batch stream records before database operations to improve throughput and reduce transaction overhead.

**Good Example:**

```typescript
import { Effect, Stream, Sink, Chunk, Option } from "effect";

interface User { readonly id: number; readonly name: string; readonly email: string }

// Stream users from a paginated API
const userStream: Stream.Stream<User> = Stream.paginateEffect(0, (page) =>
  fetchUserPage(page).pipe(
    Effect.map((res) => [
      Chunk.fromIterable(res.users),
      res.nextPage !== null ? Option.some(res.nextPage) : Option.none(),
    ])
  )
);

// Batch into groups of 100 and insert
const program = Effect.gen(function* () {
  const totalInserted = yield* userStream.pipe(
    Stream.grouped(100),
    Stream.mapEffect((batch) => insertUserBatch(Chunk.toArray(batch))),
    Stream.runFold(0, (acc, count) => acc + count)
  );
  console.log(`Total users inserted: ${totalInserted}`);
});
```

**Rationale:** Inserting records one-by-one creates excessive database round-trips and transaction overhead. Batching groups N records into a single bulk operation, amortizing overhead and improving throughput by 10-50x.

---

### Write Stream Events to Event Log

**Rule:** Append stream events to an event log with metadata to maintain a complete, ordered, immutable record.

**Good Example:**

```typescript
import { Effect, Stream, Data, DateTime } from "effect";

type AccountEvent =
  | AccountCreated
  | MoneyDeposited
  | MoneyWithdrawn;

class AccountCreated extends Data.TaggedError("AccountCreated")<{
  readonly accountId: string; readonly owner: string; readonly initialBalance: number;
}> {}
class MoneyDeposited extends Data.TaggedError("MoneyDeposited")<{
  readonly accountId: string; readonly amount: number;
}> {}
class MoneyWithdrawn extends Data.TaggedError("MoneyWithdrawn")<{
  readonly accountId: string; readonly amount: number;
}> {}

// Wrap each event with metadata and append to log
const appendToLog = (event: AccountEvent, aggregateId: string) =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const stored = {
      eventId: `evt-${Date.now()}`,
      eventType: event._tag,
      aggregateId,
      timestamp: now.toEpochMillis(),
      data: event,
    };
    // Append to persistent event store
    yield* Effect.log(`[v] ${stored.eventType}: ${aggregateId}`);
    return stored;
  });

const program = Effect.gen(function* () {
  const events: Stream.Stream<[string, AccountEvent]> = Stream.fromIterable([
    ["acc-1", new AccountCreated({ accountId: "acc-1", owner: "Alice", initialBalance: 1000 })],
    ["acc-1", new MoneyDeposited({ accountId: "acc-1", amount: 500 })],
    ["acc-1", new MoneyWithdrawn({ accountId: "acc-1", amount: 200 })],
  ]);

  const count = yield* events.pipe(
    Stream.mapEffect(([id, event]) => appendToLog(event, id)),
    Stream.runCount
  );
  console.log(`Total events appended: ${count}`);
});
```

**Rationale:** Event logs provide immutable, ordered records for event sourcing, audit trails, and temporal queries. Append-only writes are fast, naturally ordered, and enable state reconstruction by replaying events.

---

### Write Stream Lines to File

**Rule:** Write streaming lines to a file with buffered output and proper resource management using Effect scopes.

**Good Example:**

```typescript
import { Effect, Stream, Sink, FileSystem } from "effect";

interface LogEntry {
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly timestamp: number;
}

const formatLine = (entry: LogEntry): string =>
  `[${new Date(entry.timestamp).toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}`;

const program = Effect.gen(function* () {
  const logStream: Stream.Stream<LogEntry> = Stream.fromIterable([
    { level: "info", message: "Server starting", timestamp: Date.now() },
    { level: "warn", message: "High memory usage", timestamp: Date.now() + 300 },
    { level: "error", message: "Connection timeout", timestamp: Date.now() + 500 },
  ]);

  // Format, join with newlines, and write to file
  const lines = yield* logStream.pipe(
    Stream.map(formatLine),
    Stream.runCollect
  );

  yield* FileSystem.writeFileUtf8("/tmp/app.log", lines.join("\n") + "\n");
  console.log(`Wrote ${lines.length} log lines`);
});
```

**Rationale:** Buffer lines before flushing to disk to reduce I/O system calls. Use Effect scopes to ensure file handles are closed properly even on errors. Essential for log files, CSV export, and streaming data archival.

---

### Send Stream Records to Message Queue

**Rule:** Stream records to message queues with batching and partition-based routing for reliable distributed data flow.

**Good Example:**

```typescript
import { Effect, Stream, Chunk } from "effect";

interface SensorReading {
  readonly sensorId: string;
  readonly location: string;
  readonly temperature: number;
  readonly timestamp: number;
}

const publishBatch = (topic: string, partition: string, messages: readonly SensorReading[]) =>
  Effect.gen(function* () {
    yield* Effect.log(`Published ${messages.length} messages to ${topic}/${partition}`);
    return messages.length;
  });

const program = Effect.gen(function* () {
  const readings: Stream.Stream<SensorReading> = Stream.fromIterable([
    { sensorId: "temp-1", location: "warehouse-a", temperature: 22.5, timestamp: Date.now() },
    { sensorId: "temp-2", location: "warehouse-b", temperature: 21.0, timestamp: Date.now() },
    { sensorId: "temp-3", location: "warehouse-a", temperature: 22.8, timestamp: Date.now() },
  ]);

  // Group by location (partition key), batch, and publish
  const published = yield* readings.pipe(
    Stream.groupByKey((r) => r.location),
    Stream.mergeGroupBy((partition, stream) =>
      stream.pipe(
        Stream.grouped(100),
        Stream.mapEffect((batch) =>
          publishBatch("sensor-readings", partition, Chunk.toArray(batch))
        )
      )
    ),
    Stream.runFold(0, (acc, count) => acc + count)
  );
  console.log(`Total messages published: ${published}`);
});
```

**Rationale:** Message queues decouple producers from consumers for scalable, durable event distribution. Batch by partition key for data locality and reduced round-trips. Queues handle backpressure, ordering, and reliability.

---

### Fall Back to Alternative Sink on Failure

**Rule:** Implement fallback sinks for graceful degradation — try the primary destination, fall back to alternatives if it fails.

**Good Example:**

```typescript
import { Effect, Stream, Data } from "effect";

interface Order { readonly orderId: string; readonly total: number }

class CacheError extends Data.TaggedError("CacheError")<{ readonly reason: string }> {}
class DbError extends Data.TaggedError("DbError")<{ readonly reason: string }> {}

const writeToCache = (order: Order) =>
  Effect.gen(function* () {
    // Fast in-memory cache — may fail if full
    yield* Effect.log(`[CACHE] ${order.orderId}`);
  });

const writeToDb = (order: Order) =>
  Effect.gen(function* () {
    // Reliable database — may fail on timeout
    yield* Effect.log(`[DB] ${order.orderId}`);
  });

const writeToDeadLetter = (order: Order) =>
  Effect.gen(function* () {
    // Always-available file sink
    yield* Effect.log(`[DEAD-LETTER] ${order.orderId}`);
  });

// Try cache → database → dead letter
const writeWithFallback = (order: Order) =>
  writeToCache(order).pipe(
    Effect.catchAll(() => writeToDb(order)),
    Effect.catchAll(() => writeToDeadLetter(order))
  );

const program = Effect.gen(function* () {
  const orders = Stream.fromIterable([
    { orderId: "order-1", total: 99.99 },
    { orderId: "order-2", total: 149.99 },
  ]);

  yield* orders.pipe(
    Stream.mapEffect(writeWithFallback),
    Stream.runDrain
  );
});
```

**Rationale:** Production systems need resilience. Fallback sinks ensure data is persisted even when the primary destination fails, providing progressive degradation instead of complete failure.

---

### Retry Failed Stream Operations

**Rule:** Implement retry with exponential backoff in stream processing to handle transient failures automatically.

**Good Example:**

```typescript
import { Effect, Stream, Schedule, Duration } from "effect";

interface UserRecord { readonly userId: string; readonly name: string }

class WriteError extends Error {
  readonly isTransient: boolean;
  constructor(message: string, isTransient = true) {
    super(message);
    this.isTransient = isTransient;
  }
}

const insertUser = (user: UserRecord) =>
  Effect.gen(function* () {
    // Simulate occasional transient failures
    if (Math.random() < 0.3) {
      return yield* Effect.fail(new WriteError(`Timeout writing ${user.userId}`));
    }
    yield* Effect.log(`Wrote ${user.userId}`);
  });

// Retry transient failures with exponential backoff
const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
  Schedule.jittered,
  Schedule.whileInput<WriteError>((e) => e.isTransient),
  Schedule.compose(Schedule.recurs(5))
);

const program = Effect.gen(function* () {
  const users = Stream.fromIterable([
    { userId: "user-1", name: "Alice" },
    { userId: "user-2", name: "Bob" },
    { userId: "user-3", name: "Charlie" },
  ]);

  yield* users.pipe(
    Stream.mapEffect((user) =>
      insertUser(user).pipe(
        Effect.retry(retryPolicy),
        Effect.catchAll((e) => Effect.log(`Permanently failed: ${user.userId} - ${e.message}`))
      )
    ),
    Stream.runDrain
  );
});
```

**Rationale:** Transient failures (network timeouts, rate limits, temporary unavailability) resolve on their own. Exponential backoff with jitter prevents thundering herd while recovering automatically. Distinguish transient vs permanent failures to avoid wasting retries.
