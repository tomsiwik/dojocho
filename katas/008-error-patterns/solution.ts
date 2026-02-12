import { Data, Effect } from "effect";

export class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly url: string;
}> {}

export class TimeoutError extends Data.TaggedError("TimeoutError")<{
  readonly ms: number;
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
  readonly reason: string;
}> {}

// TODO: Use Effect.catchTags to handle each error type differently:
// NetworkError → "network error: {url}"
// TimeoutError → "timeout after {ms}ms"
// AuthError → "auth failed: {reason}"
export const handleAllErrors = (
  effect: Effect.Effect<string, NetworkError | TimeoutError | AuthError>,
): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

// TODO: Use Effect.orElse to try the primary effect, and if it fails, run the fallback
export const withFallback = (
  primary: Effect.Effect<string, string>,
  fallback: Effect.Effect<string, string>,
): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};

// TODO: Use Effect.match to return "ok: {value}" on success or "err: {error}" on failure
export const toResult = (
  effect: Effect.Effect<string, string>,
): Effect.Effect<string> => {
  throw new Error("Not implemented");
};
