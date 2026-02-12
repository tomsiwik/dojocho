import { Context, Data, Effect, Layer, Option, Schema } from "effect";

// === Domain Types ===

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly id: number;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
}> {}

export const ProductSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  price: Schema.Number,
});
export type Product = typeof ProductSchema.Type;

// === Services ===

export class ProductRepo extends Context.Tag("ProductRepo")<
  ProductRepo,
  {
    readonly findById: (id: number) => Effect.Effect<Product, NotFoundError>;
    readonly findAll: () => Effect.Effect<Product[]>;
  }
>() {}

// === Tasks ===

// TODO: Look up a product by id. If found, return it. If not, return Option.none.
export const findProduct = (
  id: number,
): Effect.Effect<Option.Option<Product>, never, ProductRepo> => {
  throw new Error("Not implemented");
};

// TODO: Validate that price > 0, then look up product by id.
// If price invalid: fail with ValidationError
// If product not found: fail with NotFoundError
export const getValidatedProduct = (
  id: number,
  minPrice: number,
): Effect.Effect<Product, NotFoundError | ValidationError, ProductRepo> => {
  throw new Error("Not implemented");
};

// TODO: Get all products, filter those with price > minPrice,
// format each as "{name}: ${price}", return as array
export const formatExpensiveProducts = (
  minPrice: number,
): Effect.Effect<string[], never, ProductRepo> => {
  throw new Error("Not implemented");
};

// TODO: Create a test Layer for ProductRepo with these products:
// { id: 1, name: "Widget", price: 9.99 }
// { id: 2, name: "Gadget", price: 24.99 }
// { id: 3, name: "Gizmo", price: 4.99 }
export const TestProductRepo: Layer.Layer<ProductRepo> = Layer.fail("Not implemented" as any);
