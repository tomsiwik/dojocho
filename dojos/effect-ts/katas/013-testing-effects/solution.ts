import { Context, Effect } from "effect";

export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  {
    readonly findById: (id: number) => Effect.Effect<string, string>;
  }
>() {}

/** Use UserRepo service to find user by id and return "User: {name}" */
export const getUser = (id: number) =>
  Effect.gen(function* () {
    throw new Error("Not implemented");
  });

/** Use UserRepo to find user, recovering from errors with "Unknown" */
export const getUserSafe = (id: number) =>
  Effect.gen(function* () {
    throw new Error("Not implemented");
  });
