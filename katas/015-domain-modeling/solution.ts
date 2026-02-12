import { Data, Effect, Option, Schema } from "effect";

// Domain types
export class InvalidEmail extends Data.TaggedError("InvalidEmail")<{
  readonly email: string;
}> {}

export class InvalidAge extends Data.TaggedError("InvalidAge")<{
  readonly age: number;
}> {}

export interface User {
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly nickname: Option.Option<string>;
}

/** Validate email contains "@", fail with InvalidEmail otherwise */
export const validateEmail = (email: string): Effect.Effect<string, InvalidEmail> => {
  throw new Error("Not implemented");
};

/** Validate age is 0-150, fail with InvalidAge otherwise */
export const validateAge = (age: number): Effect.Effect<number, InvalidAge> => {
  throw new Error("Not implemented");
};

/** Use Effect.gen to validate email and age, then construct a User
 * nickname should be Option.none() */
export const createUser = (
  name: string,
  email: string,
  age: number,
): Effect.Effect<User, InvalidEmail | InvalidAge> => {
  throw new Error("Not implemented");
};

/** Format user as "{name} <{email}>" with optional " aka {nickname}" if present */
export const formatUser = (user: User): string => {
  throw new Error("Not implemented");
};
