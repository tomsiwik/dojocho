import { Data, Effect } from "effect";

// TODO: Define NotFoundError as a Data.TaggedError with a message field
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly message: string;
}> {}

// TODO: Define ValidationError as a Data.TaggedError with a message field
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
}> {}

export interface User {
  readonly id: number;
  readonly name: string;
}

// TODO: Return user { id, name: "User {id}" }. Fail with NotFoundError when id < 0.
export const findUser = (
  id: number,
): Effect.Effect<User, NotFoundError> => {
  throw new Error("Not implemented");
};

// TODO: Fail with ValidationError when age < 0 or age > 150. Succeed with the age.
export const validateAge = (
  age: number,
): Effect.Effect<number, ValidationError> => {
  throw new Error("Not implemented");
};

// TODO: Wrap findUser, recovering from NotFoundError with { id: 0, name: "Guest" }.
export const findUserOrDefault = (
  id: number,
): Effect.Effect<User> => {
  throw new Error("Not implemented");
};
