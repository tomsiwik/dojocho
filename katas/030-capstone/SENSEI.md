# SENSEI — 030 Capstone

## Briefing

### Goal

Bring it all together -- services, layers, tagged errors, Option, Schema, and testing in one mini-application.

### Tasks

1. Implement `findProduct` -- look up a product by id. If found, return it wrapped in `Option.some`. If not found, catch the error and return `Option.none`.
2. Implement `getValidatedProduct` -- validate that price meets `minPrice`, then look up the product by id. Fail with `ValidationError` if price is invalid, or `NotFoundError` if the product is not found.
3. Implement `formatExpensiveProducts` -- get all products, filter those with price above `minPrice`, and format each as `"{name}: ${price}"`.
4. Implement `TestProductRepo` -- create a test `Layer` for `ProductRepo` with three products: Widget ($9.99), Gadget ($24.99), and Gizmo ($4.99).

## Prerequisites

- **All prior katas** — this capstone draws on every area: basics, error handling, services, layers, Option, Schema, and composition.

## Skills

Invoke `effect-patterns-building-apis` before teaching this kata.

## Concepts Practiced

APIs the user writes in `solution.ts`:

- `Effect.gen` + `yield*` — generator sequencing with service access (review)
- `Option.some` / `Option.none()` — wrapping optional results
- `Effect.catchTag` or `Effect.catchAll` — recovering from tagged errors
- `Effect.fail` — producing typed errors (review)
- `Data.TaggedError` — domain error definitions (provided, but used in logic)
- `Layer.succeed` — creating a test layer for `ProductRepo`
- `Effect.map` — transforming results (review)
- `Array.filter` / `Array.map` — standard array operations inside Effects

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

### When stuck

1. Start with `TestProductRepo` — define the three products, implement `findById` (find in array or fail with NotFoundError) and `findAll` (return all)
2. For `findProduct`: "Use `Effect.gen` — yield the ProductRepo, call findById, wrap in `Option.some`. Then catch `NotFoundError` and return `Option.none()`"
3. For `getValidatedProduct`: "Yield the repo, call findById, check if product.price >= minPrice, fail with ValidationError if not"
4. For `formatExpensiveProducts`: "Yield the repo, call findAll, filter by price, map to formatted strings"
5. Refer them to the Layer, Option, and catchTag patterns in the Concepts Practiced section above

## On Completion

### Insight

This capstone proves you can build real applications with Effect: **services** for architecture, **layers** for composition and testing, **tagged errors** for type-safe failure handling, **Option** for optional results, **Schema** for domain modeling. Every pattern you learned works together naturally — services are injected, errors are caught and transformed, optional values are wrapped, and layers make it all testable. The `never` error type in `findProduct` and `formatExpensiveProducts` is a compile-time guarantee that these functions handle all their errors internally.

### Bridge

Congratulations — you have completed the entire Effect Kata dojo. You've gone from `Effect.succeed` to building a fully-typed, testable, service-oriented application. The patterns you practiced — composition, typed errors, dependency injection, streams, observability, and resource management — are the foundation of production Effect-TS code. Keep these katas as a reference, and build something real.
