---
name: effect-patterns-building-apis
description: "Effect-TS patterns for building HTTP APIs with routing, middleware, error handling, and structured responses. Use when implementing REST endpoints, request validation, middleware chains, authentication, CORS, rate limiting, or API error handling with Effect-TS and @effect/platform."
---

# Effect-TS Patterns: Building APIs

This skill provides 13 curated Effect-TS patterns for building HTTP APIs with Effect-TS.

Use this skill when working on tasks related to:
- HTTP routing and request handling
- JSON responses, path parameters, and request validation
- Middleware composition, authentication, and CORS
- API error handling and rate limiting
- HTTP client requests and OpenAPI documentation

## Workflow

1. **Set up server** — Create HTTP server with `NodeHttpServer`
2. **Define routes** — Use `Http.router.get/post/put/delete` for each endpoint
3. **Add middleware** — Compose logging, auth, CORS, rate limiting
4. **Handle errors** — Use tagged errors and `Effect.catchTags` for structured responses
5. **Validate input** — Parse request bodies and path parameters with schemas

---

## Beginner Patterns

### Handle a GET Request

**Rule:** Use `Http.router.get` to associate a URL path with a specific response Effect. The router handles 404 responses for unmatched paths automatically.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http, NodeHttpServer, NodeRuntime } from "@effect/platform-node";

const app = Http.router.empty.pipe(
  Http.router.get("/", Http.response.text("Welcome to the home page!")),
  Http.router.get("/hello", Http.response.text("Hello, Effect!"))
);

const server = Http.server.serve(app).pipe(
  Effect.provide(NodeHttpServer.layer({ port: 3000 }))
);

NodeRuntime.runMain(server);
```

**Anti-Pattern:** Do not create a single monolithic handler with `if/else` URL checks — use `Http.router` for declarative, composable, type-safe routing.

---

### Send a JSON Response

**Rule:** Use `Http.response.json` to automatically serialize data and set `Content-Type: application/json` headers.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

const getUserRoute = Http.router.get(
  "/users/1",
  Effect.succeed({ id: 1, name: "Paul", team: "Effect" }).pipe(
    Effect.flatMap((user) => Http.response.json(user))
  )
);
```

**Anti-Pattern:** Do not manually `JSON.stringify` and set Content-Type headers — `Http.response.json` handles serialization and headers correctly.

---

### Extract Path Parameters

**Rule:** Use `Http.router.params` to extract dynamic segments from URL paths (e.g., `/users/:id`).

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

const getUserRoute = Http.router.get(
  "/users/:id",
  Effect.gen(function* () {
    const params = yield* Http.router.params;
    const userId = params.id;
    // Look up user by userId
    return yield* Http.response.json({ id: userId, name: "Alice" });
  })
);
```

**Rationale:** Path parameters provide type-safe URL segment extraction. Define dynamic segments with `:paramName` in the route path, then access them via `Http.router.params`.

---

### Create a Basic HTTP Server

**Rule:** Use `Http.server.serve` with `NodeHttpServer.layer` to create a production-ready HTTP server from a router.

**Good Example:**

```typescript
import { Effect, Layer } from "effect";
import { Http, NodeHttpServer, NodeRuntime } from "@effect/platform-node";

const app = Http.router.empty.pipe(
  Http.router.get("/health", Http.response.json({ status: "ok" })),
  Http.router.get("/users", Http.response.json([{ id: 1, name: "Alice" }]))
);

const ServerLive = NodeHttpServer.layer({ port: 3000 });

const server = Http.server.serve(app).pipe(Effect.provide(ServerLive));

NodeRuntime.runMain(server);
```

**Rationale:** `Http.server.serve` converts a router into a running server. The `NodeHttpServer.layer` provides the platform-specific implementation. Use `NodeRuntime.runMain` to handle graceful shutdown.

---

## Intermediate Patterns

### Validate Request Body

**Rule:** Use `Http.request.json` with schema validation to parse and validate incoming request bodies with type safety.

**Good Example:**

```typescript
import { Effect, Schema } from "effect";
import { Http } from "@effect/platform";

const CreateUser = Schema.Struct({
  name: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/)),
  age: Schema.Number.pipe(Schema.greaterThan(0)),
});

const createUserRoute = Http.router.post(
  "/users",
  Effect.gen(function* () {
    const body = yield* Http.request.json;
    const user = yield* Schema.decodeUnknown(CreateUser)(body);
    // Process validated user
    return yield* Http.response.json({ id: "new-id", ...user }, { status: 201 });
  })
);
```

**Rationale:** Schema validation at the API boundary catches malformed input early with clear error messages, preventing invalid data from reaching business logic.

---

### Provide Dependencies to Routes

**Rule:** Use `Effect.provide` and `Layer` to inject services into route handlers, keeping routes testable and decoupled.

**Good Example:**

```typescript
import { Effect, Layer } from "effect";
import { Http } from "@effect/platform";

class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
  sync: () => ({
    findById: (id: string) => Effect.succeed({ id, name: "Alice" }),
  }),
}) {}

const getUserRoute = Http.router.get(
  "/users/:id",
  Effect.gen(function* () {
    const params = yield* Http.router.params;
    const repo = yield* UserRepo;
    const user = yield* repo.findById(params.id);
    return yield* Http.response.json(user);
  })
);

// Provide dependencies when serving
const app = Http.router.empty.pipe(Http.router.concat(getUserRoute));
const server = Http.server.serve(app).pipe(Effect.provide(UserRepo.Default));
```

**Rationale:** Dependency injection via layers keeps route handlers focused on business logic. Services can be swapped for testing (e.g., in-memory repo vs database repo).

---

### Handle API Errors

**Rule:** Use tagged errors and `Effect.catchTags` to map domain errors to appropriate HTTP status codes and structured error responses.

**Good Example:**

```typescript
import { Effect, Data } from "effect";
import { Http } from "@effect/platform";

class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string;
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
}> {}

const getUserRoute = Http.router.get(
  "/users/:id",
  Effect.gen(function* () {
    const params = yield* Http.router.params;
    if (params.id === "0") {
      return yield* Effect.fail(new NotFoundError({ resource: `User ${params.id}` }));
    }
    return yield* Http.response.json({ id: params.id, name: "Alice" });
  }).pipe(
    Effect.catchTags({
      NotFoundError: (e) => Http.response.json({ error: e.resource }, { status: 404 }),
      ValidationError: (e) => Http.response.json({ error: e.message }, { status: 400 }),
    })
  )
);
```

**Rationale:** Tagged errors provide exhaustive, type-safe error handling. The compiler ensures every error variant has a handler, preventing unhandled cases from leaking as 500 responses.

---

### Add Rate Limiting to APIs

**Rule:** Use `Ref` and middleware to implement rate limiting that protects API endpoints from abuse.

**Good Example:**

```typescript
import { Effect, Ref, HashMap } from "effect";
import { Http } from "@effect/platform";

const RateLimiter = Effect.gen(function* () {
  const requests = yield* Ref.make(HashMap.empty<string, number>());

  return {
    check: (clientId: string, limit: number, windowMs: number) =>
      Effect.gen(function* () {
        const now = Date.now();
        const counts = yield* Ref.get(requests);
        const count = HashMap.get(counts, clientId).pipe(
          Effect.getOrElse(() => 0)
        );
        if (count >= limit) {
          return yield* Effect.fail("Rate limit exceeded");
        }
        yield* Ref.update(requests, HashMap.set(clientId, count + 1));
        return true;
      }),
  };
});
```

**Rationale:** Rate limiting with `Ref` provides thread-safe, concurrent-friendly request tracking. Implement as middleware to apply uniformly across routes without duplicating logic.

---

## Advanced Patterns

### Compose API Middleware

**Rule:** Use `Http.middleware.make` to create reusable middleware that wraps route handlers with cross-cutting concerns like logging, timing, and headers.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

// Logging middleware
const withLogging = Http.middleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* Http.request.ServerRequest;
    const start = Date.now();
    const response = yield* app;
    const duration = Date.now() - start;
    yield* Effect.log(`${request.method} ${request.url} - ${duration}ms`);
    return response;
  })
);

// Apply middleware to router
const app = Http.router.empty.pipe(
  Http.router.get("/health", Http.response.text("ok")),
  withLogging
);
```

**Rationale:** Middleware composition keeps cross-cutting concerns (logging, auth, headers) separate from route logic. Stack multiple middleware with `pipe` — they execute in order, wrapping the inner handler.

---

### Configure CORS for APIs

**Rule:** Use CORS middleware to configure cross-origin resource sharing headers for browser-accessible APIs.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

const withCors = Http.middleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* Http.request.ServerRequest;
    if (request.method === "OPTIONS") {
      return Http.response.empty({ status: 204 }).pipe(
        Http.response.setHeader("Access-Control-Allow-Origin", "*"),
        Http.response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"),
        Http.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      );
    }
    const response = yield* app;
    return response.pipe(
      Http.response.setHeader("Access-Control-Allow-Origin", "*")
    );
  })
);
```

**Rationale:** CORS middleware handles preflight OPTIONS requests and sets appropriate headers on all responses. Configure allowed origins, methods, and headers based on your security requirements.

---

### Implement API Authentication

**Rule:** Use authentication middleware to verify tokens/credentials before route handlers execute, providing the authenticated user context to downstream handlers.

**Good Example:**

```typescript
import { Effect, Data } from "effect";
import { Http } from "@effect/platform";

class AuthError extends Data.TaggedError("AuthError")<{ readonly message: string }> {}

const withAuth = Http.middleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* Http.request.ServerRequest;
    const authHeader = request.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return yield* Effect.fail(new AuthError({ message: "Missing token" }));
    }
    const token = authHeader.slice(7);
    // Verify token (simplified)
    if (token !== "valid-token") {
      return yield* Effect.fail(new AuthError({ message: "Invalid token" }));
    }
    return yield* app;
  }).pipe(
    Effect.catchTag("AuthError", (e) =>
      Http.response.json({ error: e.message }, { status: 401 })
    )
  )
);
```

**Rationale:** Authentication middleware centralizes token verification, preventing unauthorized access and keeping auth logic out of individual route handlers.

---

### Make an Outgoing HTTP Client Request

**Rule:** Use `Http.client.fetch` to make type-safe outgoing HTTP requests from your server, composing request building with response parsing.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

const fetchUser = (id: number) =>
  Effect.gen(function* () {
    const client = yield* Http.client.Client;
    const response = yield* client.pipe(
      Http.client.filterStatusOk,
      Http.client.mapRequest(
        Http.request.get(`https://api.example.com/users/${id}`)
      )
    );
    const user = yield* Http.response.json(response);
    return user;
  });
```

**Rationale:** `Http.client` integrates outgoing requests into the Effect ecosystem with automatic error handling for non-2xx responses, composable request/response transformations, and full dependency injection support.

---

### Generate OpenAPI Documentation

**Rule:** Use `@effect/platform`'s OpenAPI support to generate API documentation from your route definitions automatically.

**Good Example:**

```typescript
import { Effect } from "effect";
import { Http } from "@effect/platform";

// Routes with schema annotations generate OpenAPI specs
const app = Http.router.empty.pipe(
  Http.router.get("/users", Http.response.json([{ id: 1, name: "Alice" }])),
  Http.router.get("/users/:id", Effect.gen(function* () {
    const params = yield* Http.router.params;
    return yield* Http.response.json({ id: params.id, name: "Alice" });
  }))
);

// Generate OpenAPI spec from router
// The exact API depends on @effect/platform version
```

**Rationale:** Generating OpenAPI docs from route definitions keeps documentation in sync with implementation. Schema-annotated routes produce accurate request/response specs automatically.
