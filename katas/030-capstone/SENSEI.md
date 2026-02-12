# SENSEI — 030 Capstone

## Briefing

### Goal

Bring it all together -- services, layers, tagged errors, Option, Schema, and testing in one mini-application.

### Tasks

1. Implement `findProduct` -- look up a product by id. If found, return it wrapped in `Option.some`. If not found, catch the error and return `Option.none`.
2. Implement `getValidatedProduct` -- validate that price meets `minPrice`, then look up the product by id. Fail with `ValidationError` if price is invalid, or `NotFoundError` if the product is not found.
3. Implement `formatExpensiveProducts` -- get all products, filter those with price above `minPrice`, and format each as `"{name}: ${price}"`.
4. The `TestProductRepo` is provided in the test file — study it to understand the service interface.

## Prerequisites

- **All prior katas** — this capstone draws on every area: basics, error handling, services, layers, Option, Schema, and composition.

## Skills

Invoke `effect-patterns-building-apis` before teaching this kata.

> **Note**: `Effect.runSync`, `Effect.runSyncExit`, `Effect.provide`, `Option.isSome`, `Option.isNone`, and `Exit.isFailure` appear only in tests. Never attribute them to the user's learning.

## Test Map

| Test | Concept | Verifies |
|------|---------|----------|
| `findProduct(1) returns Some(Widget)` | Service access + `Option.some` | Repo lookup wraps found product in `Some` |
| `findProduct(99) returns None` | `Effect.catchTag` + `Option.none` | Repo throws `NotFoundError`, caught and converted to `None` |
| `getValidatedProduct(1, 5) succeeds` | Service + validation | Widget (price 9.99) passes `minPrice: 5` check |
| `getValidatedProduct(1, 20) fails with ValidationError` | `Effect.fail` + `ValidationError` | Widget (price 9.99) fails `minPrice: 20` check |
| `getValidatedProduct(99, 0) fails with NotFoundError` | Error propagation | Product not found, `NotFoundError` propagates |
| `formatExpensiveProducts(5) returns Widget and Gadget` | Service + filter + format | `findAll` -> filter `price > 5` -> format as `"Name: $price"` |

## Teaching Approach

### Socratic prompts

- "You need to call `repo.findById(id)` which might fail with `NotFoundError`. But `findProduct` should return `Option<Product>`, not fail. How do you convert a failure into a `None`?"
- "For `getValidatedProduct`, there are two things that can go wrong: invalid price and product not found. Which should you check first? Does the order matter?"
- "How do you create a `Layer` that provides a `ProductRepo` implementation? What methods does the service interface require?"
- "For `formatExpensiveProducts`, the return type has `never` in the error channel. What does that tell you about error handling?"

### Common pitfalls

1. **findProduct must catch NotFoundError and return None** — the return type is `Effect<Option<Product>, never, ProductRepo>` with `never` in the error position. This means the function must not fail. Use `Effect.catchTag("NotFoundError", () => Effect.succeed(Option.none()))` to convert the error. Ask: "What does `never` in the error type mean for your implementation?"
2. **getValidatedProduct validation order** — find the product first, then check if its price meets `minPrice`. The test for id=1 minPrice=20 expects `ValidationError`, meaning the product was found (price 9.99) but failed validation. Ask: "Do you validate the price before or after looking up the product?"
3. **TestProductRepo needs both findById and findAll** — `findById` should find a product by id or fail with `NotFoundError`. `findAll` should return all three products. Students may forget one method. Ask: "What does the `ProductRepo` interface require?"
4. **Format string must match exactly** — the test expects `"Widget: $9.99"` format. Students may use different formatting. Ask: "Check the test assertion — what exact string format does it expect?"
5. **Layer.succeed vs Layer.effect** — since the repo methods return Effects but don't need external state, `Layer.succeed(ProductRepo, { ... })` works. The service value is the object with `findById` and `findAll` methods.
6. **Start with `TestProductRepo`** — define the three products first, implement `findById` (find in array or fail with NotFoundError) and `findAll` (return all). Everything else depends on having the repo.

## On Completion

### Insight

This capstone proves you can build real applications with Effect: **services** for architecture, **layers** for composition and testing, **tagged errors** for type-safe failure handling, **Option** for optional results, **Schema** for domain modeling. Every pattern you learned works together naturally — services are injected, errors are caught and transformed, optional values are wrapped, and layers make it all testable. The `never` error type in `findProduct` and `formatExpensiveProducts` is a compile-time guarantee that these functions handle all their errors internally.

### Bridge

Congratulations — you've completed the core curriculum! You've gone from `Effect.succeed` to building a fully-typed, testable, service-oriented application. The patterns you practiced — composition, typed errors, dependency injection, streams, observability, and resource management — are the foundation of production Effect-TS code. Katas 031-040 cover advanced topics like configuration, causes and defects, pattern matching, coordination primitives, caching, metrics, managed runtimes, and request batching.
