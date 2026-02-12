import { Effect, Either, Exit } from "effect";

// TODO: Use Effect.either to convert an Effect<A, E> into Effect<Either<A, E>>
// then use Either.match to return "ok: {value}" or "err: {error}"
export const safeRun = (effect: Effect.Effect<string, string>): Effect.Effect<string> => {
  throw new Error("Not implemented");
};

// TODO: Use Either.right and Either.left to validate: return Right(n) if n > 0, Left("not positive") otherwise
export const validatePositive = (n: number): Either.Either<number, string> => {
  throw new Error("Not implemented");
};

// TODO: Use Effect.runSyncExit and Exit.match to return "success: {value}" or "failure"
export const inspectExit = (effect: Effect.Effect<string, string>): string => {
  throw new Error("Not implemented");
};
