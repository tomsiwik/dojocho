# SENSEI — 040 Request Batching

## Briefing

### Goal

Learn to define requests, build batched resolvers, and use Effect's automatic request batching to collapse multiple concurrent data fetches into a single batch call.

### Tasks

1. Observe the `GetUser` request type and its `Request.tagged` constructor -- these are defined for you
2. Implement `makeUserResolver` -- use `RequestResolver.makeBatched` to create a resolver that batch-fetches users
3. Implement `getUser` -- use `Effect.request` to create an effect that fetches one user
4. Implement `getUsers` -- use `Effect.forEach` with `{ batching: true }` to fetch multiple users, triggering automatic batching

### Hints

```ts
import { Effect, Request, RequestResolver } from "effect";

// RequestResolver.makeBatched receives all requests in a single batch
const resolver = RequestResolver.makeBatched(
  (requests: NonEmptyArray<MyRequest>) =>
    Effect.gen(function* () {
      const ids = requests.map((r) => r.id);
      const results = yield* fetchBatch(ids);
      // Complete each request individually
      for (const req of requests) {
        const value = results.get(req.id);
        if (value !== undefined) {
          yield* Request.succeed(req, value);
        } else {
          yield* Request.fail(req, "not found");
        }
      }
    }),
);

// Effect.request creates an effect from a request + resolver
const fetchOne = Effect.request(GetUser({ id: 1 }), resolver);

// Effect.forEach with batching groups requests into batches
const fetchMany = Effect.forEach(ids, (id) =>
  Effect.request(GetUser({ id }), resolver),
  { batching: true },
);
```

## Prerequisites

- **017 Parallel Effects** -- `Effect.all`, parallel execution
- **011 Services and Context** -- service patterns, dependency injection
- **003 Generator Pipelines** -- `Effect.gen`, `yield*`

## Test Map
> **Note**: `Effect.runPromise` and `Effect.either` appear only in tests. Never attribute them to the user's learning.

| Test | Concept | Verifies |
|------|---------|----------|
| `getUser fetches a single user` | `Effect.request` | Single request goes through resolver |
| `getUser fails for unknown id` | `Request.fail` | Resolver correctly fails missing requests |
| `getUsers fetches multiple users` | `Effect.forEach` + batching | Multiple requests return correct results |
| `getUsers batches requests into a single resolver call` | Batching proof | All 3 requests arrive in one batch (batchCount === 1) |

## Teaching Approach

### Socratic prompts

- "`RequestResolver.makeBatched` receives a `NonEmptyArray<GetUser>` -- all the requests that were collected in a single batch. Why does Effect collect them instead of sending each one individually?"
- "Inside the resolver, you must call `Request.succeed` or `Request.fail` for each request. What happens if you forget to complete a request?"
- "`Effect.forEach` with `{ batching: true }` collects all the requests before executing them. How is this different from running the requests with `{ concurrency: 'unbounded' }` alone?"

### Common pitfalls

1. **Forgetting to complete every request** -- the batched resolver must call `Request.succeed` or `Request.fail` for every request in the batch. If a request is not completed, the fiber waiting for it will hang forever. Ask: "What does an uncompleted request look like to the caller?"
2. **Not using `{ batching: true }` in `getUsers`** -- without the `batching` option, `Effect.forEach` may execute requests one at a time, defeating the purpose of batching. The test that checks `batchCount === 1` will fail. Nudge: "How does Effect know to collect requests into a batch rather than sending them immediately?"
3. **Confusing `Request.tagged` constructor usage** -- `GetUser({ id: 1 })` creates a request value, not an effect. You pass this value to `Effect.request(requestValue, resolver)` to get an effect. Students may try to call `GetUser` as if it returns an effect directly.

## On Completion

### Insight

Request batching is one of Effect's most impressive optimization patterns. You write your code as if each request is independent -- `getUser(1)`, `getUser(2)`, `getUser(3)` -- but the runtime automatically groups them into a single batch call. The resolver sees all three requests at once and can make one database query or API call instead of three. This is the N+1 query problem solved at the framework level: no manual batching logic, no DataLoader boilerplate, just declare your requests and let Effect optimize the execution. The `batching: true` option tells Effect to collect requests within the same execution scope before dispatching them to the resolver.

### Bridge

Request batching completes the advanced Effect toolkit. You have now covered domain modeling with schemas, caching for performance, metrics for observability, managed runtimes for integration, and request batching for optimization. These patterns form the backbone of production Effect applications.
