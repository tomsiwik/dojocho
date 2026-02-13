import { Effect, ParseResult, Schema } from "effect";

/** Define a Schema for User with fields: name (string), age (number) */
export const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

export type User = typeof UserSchema.Type;

/** Parse unknown input into a User, returning Effect<User, ParseError> */
export const parseUser = (input: unknown): Effect.Effect<User, ParseResult.ParseError> => {
  throw new Error("Not implemented");
};

/** Parse and validate: name must be non-empty, age must be >= 0
 * Use Schema.NonEmptyString and Schema.filter or Schema.positive */
export const StrictUserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

export const parseStrictUser = (input: unknown): Effect.Effect<typeof StrictUserSchema.Type, ParseResult.ParseError> => {
  throw new Error("Not implemented");
};
