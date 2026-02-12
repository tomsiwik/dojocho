import { Effect, Layer, ManagedRuntime } from "effect";

/** Create a managed runtime with an empty layer */
export const makeRuntime = (): ManagedRuntime.ManagedRuntime<never, never> => {
  throw new Error("Not implemented");
};

/** Run an effect synchronously using the managed runtime to greet the given name */
export const greetWith = (
  runtime: ManagedRuntime.ManagedRuntime<never, never>,
  name: string,
): string => {
  throw new Error("Not implemented");
};

/** Create a runtime, use it to greet, dispose it, return the greeting */
export const fullLifecycle = async (name: string): Promise<string> => {
  throw new Error("Not implemented");
};
