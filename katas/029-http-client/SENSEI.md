# SENSEI — 029 HTTP Client

## Briefing

### Goal

Learn to define an `HttpClient` service abstraction for testability, parse HTTP responses with `Schema`, and use `Effect.retry` with a `Schedule` for transient failures.

### Tasks

1. Implement `fetchUser` -- use `HttpClient.get` to fetch from a URL, then decode the response with `UserSchema`.
2. Implement `fetchUserWithRetry` -- fetch a user with retry logic (up to 2 retries).

## Prerequisites

- **011 Services and Context** — `Context.Tag`, `provideService`
- **014 Schema Basics** — `Schema`, encode/decode
- **016 Retry and Schedule** — `Schedule`, retry policies

## Skills

Invoke `effect-patterns-making-http-requests` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.gen` + `yield*` — generator-based sequencing (review)
- `HttpClient` service — `yield*` to access the injected HTTP client
- `Schema.decodeUnknown` — validate and decode raw response data against `UserSchema`
- `Effect.retry` — retry a failing effect according to a schedule
- `Schedule.recurs` — create a retry schedule with a fixed number of retries
- `Effect.mapError` — normalize error types (e.g., schema parse errors to string)

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, and `Effect.provideService` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `fetchUser succeeds with valid response` | `HttpClient.get` + `Schema.decodeUnknown` | Fetch from `/user/1`, decode to `{ id: 1, name: "Alice" }` |
| `fetchUser fails with invalid url` | Error propagation | Fetch from `/user/999` fails — HttpClient returns `"not found"` |
| `fetchUserWithRetry succeeds with valid response` | `fetchUser` + `Effect.retry` | Same success case, but wrapped with retry logic |

## Teaching Approach

### Socratic prompts

- "The `HttpClient` is defined as a `Context.Tag`. Why is this useful for testing — why not just use `fetch` directly?"
- "After getting a response from the HTTP client, how do you know the data has the right shape? What if the response is missing a field?"
- "For `fetchUserWithRetry`, should you re-implement the HTTP call, or can you build on top of `fetchUser`?"

### Common pitfalls

1. **Schema.decodeUnknown returns an Effect with ParseError** — the function signature expects errors as `string`, so you may need `Effect.mapError` to convert the ParseError to a string. Ask: "What error type does `Schema.decodeUnknown(UserSchema)` produce? What does your function's type signature expect?"
2. **fetchUserWithRetry wraps fetchUser, not the raw HTTP call** — avoid duplicating the fetch+decode logic. Simply call `fetchUser(url)` and pipe it through `Effect.retry`. Ask: "You already have `fetchUser` working. How can you add retry to it without rewriting it?"
3. **Accessing the HttpClient service** — inside `Effect.gen`, use `yield* HttpClient` to get the service implementation. Students sometimes try to call `HttpClient.get` directly as a static method. Ask: "How do you access a service inside a generator?"
4. **Schedule.recurs argument** — `Schedule.recurs(2)` means 2 retries (3 total attempts). Students may confuse retries with total attempts.

### When stuck

1. Start with `fetchUser` — "Use `Effect.gen`. First, yield the HttpClient to get the service. Then call `.get(url)`. Then decode the result with `Schema.decodeUnknown(UserSchema)`"
2. For error mapping: "If `Schema.decodeUnknown` gives you a `ParseError` but you need a `string`, use `Effect.mapError` to convert it"
3. For `fetchUserWithRetry`: "Just call `fetchUser(url)` and pipe it through `Effect.retry(Schedule.recurs(2))`"
4. Refer them to the service access and schema decode patterns in the Concepts Practiced section above

## On Completion

### Insight

The HttpClient is a service — making it injectable means tests don't need a real HTTP server. Schema validates the response shape at the boundary. Retry handles transient failures. This pattern — **service abstraction + schema validation + retry** — is the standard approach for HTTP in Effect applications. Notice how each concern is separate and composable: you didn't write retry logic inside your HTTP call, and you didn't hardcode the HTTP implementation.

### Bridge

Kata 030 is the **capstone** — bringing together services, layers, tagged errors, Option, Schema, and everything else you've learned into a complete mini-application. It's the final kata in the dojo.
