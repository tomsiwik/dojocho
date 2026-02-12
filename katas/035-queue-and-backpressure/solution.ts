import { Effect, Queue, Fiber } from "effect";

/** Create an unbounded queue, offer all items, take them back */
export const roundTrip = <A>(
  items: A[],
): Effect.Effect<A[]> => {
  throw new Error("Not implemented");
};

/** Create a bounded queue (capacity 2), fork a producer that offers 1, 2, 3,
 * take 3 items from consumer side, return them */
export const backpressureDemo = (): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};

/** Producer offers 1..n into a bounded queue, consumer takes all n items */
export const producerConsumer = (
  n: number,
): Effect.Effect<number[]> => {
  throw new Error("Not implemented");
};
