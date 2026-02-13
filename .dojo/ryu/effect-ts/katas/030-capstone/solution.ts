import { Context, Data, Effect, Option, Schema } from "effect";

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

/** Look up a product by id. If found, return it. If not, return Option.none. */
export const findProduct = (
  id: number,
): Effect.Effect<Option.Option<Product>, never, ProductRepo> => {
  throw new Error("Not implemented");
};

/** Validate that price > 0, then look up product by id.
 * If price invalid: fail with ValidationError
 * If product not found: fail with NotFoundError */
export const getValidatedProduct = (
  id: number,
  minPrice: number,
): Effect.Effect<Product, NotFoundError | ValidationError, ProductRepo> => {
  throw new Error("Not implemented");
};

/** Get all products, filter those with price > minPrice,
 * format each as "{name}: ${price}", return as array */
export const formatExpensiveProducts = (
  minPrice: number,
): Effect.Effect<string[], never, ProductRepo> => {
  throw new Error("Not implemented");
};
