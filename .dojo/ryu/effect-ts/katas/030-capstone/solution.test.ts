import { Effect, Exit, Layer, Option } from "effect";
import { describe, expect, it } from "vitest";
import {
  findProduct,
  getValidatedProduct,
  formatExpensiveProducts,
  ProductRepo,
  NotFoundError,
} from "@/katas/030-capstone/solution.js";

const testProducts = [
  { id: 1, name: "Widget", price: 9.99 },
  { id: 2, name: "Gadget", price: 24.99 },
  { id: 3, name: "Gizmo", price: 4.99 },
];

const TestProductRepo = Layer.succeed(ProductRepo, {
  findById: (id: number) => {
    const product = testProducts.find((p) => p.id === id);
    if (product) return Effect.succeed(product);
    return Effect.fail(new NotFoundError({ id }));
  },
  findAll: () => Effect.succeed(testProducts),
});

const run = <A, E>(effect: Effect.Effect<A, E, any>) =>
  Effect.runSync(Effect.provide(effect, TestProductRepo));

const runExit = <A, E>(effect: Effect.Effect<A, E, any>) =>
  Effect.runSyncExit(Effect.provide(effect, TestProductRepo));

describe("030 — Capstone", () => {
  it("findProduct(1) returns Some(Widget)", () => {
    const result = run(findProduct(1));
    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value.name).toBe("Widget");
    }
  });

  it("findProduct(99) returns None", () => {
    const result = run(findProduct(99));
    expect(Option.isNone(result)).toBe(true);
  });

  it("getValidatedProduct(1, 5) succeeds", () => {
    const result = run(getValidatedProduct(1, 5));
    expect(result.name).toBe("Widget");
  });

  it("getValidatedProduct(1, 20) fails with ValidationError", () => {
    const exit = runExit(getValidatedProduct(1, 20));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("getValidatedProduct(99, 0) fails with NotFoundError", () => {
    const exit = runExit(getValidatedProduct(99, 0));
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it("formatExpensiveProducts(5) returns Widget and Gadget", () => {
    const result = run(formatExpensiveProducts(5));
    expect(result).toContain("Widget: $9.99");
    expect(result).toContain("Gadget: $24.99");
    expect(result).not.toContain("Gizmo");
  });
});
