import { Context, Effect, Schema } from "effect";

// Abstract HTTP client service for testability
export class HttpClient extends Context.Tag("HttpClient")<
  HttpClient,
  { readonly get: (url: string) => Effect.Effect<unknown, string> }
>() {}

export const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

export type User = typeof UserSchema.Type;

/** Use HttpClient.get to fetch from the url, then decode with UserSchema */
export const fetchUser = (url: string): Effect.Effect<User, string, HttpClient> => {
  throw new Error("Not implemented");
};

/** Fetch user with retry (up to 2 retries) */
export const fetchUserWithRetry = (url: string): Effect.Effect<User, string, HttpClient> => {
  throw new Error("Not implemented");
};
