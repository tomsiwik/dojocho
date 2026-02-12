import { Effect } from "effect";

export interface DivisionByZero {
  readonly _tag: "DivisionByZero";
}

export interface ParseError {
  readonly _tag: "ParseError";
  readonly input: string;
}

// TODO: Return a / b as an Effect. Fail with DivisionByZero when b === 0.
export const divide = (
  a: number,
  b: number,
): Effect.Effect<number, DivisionByZero> => {
  throw new Error("Not implemented");
};

// TODO: Wrap divide and recover from DivisionByZero by returning 0.
export const safeDivide = (a: number, b: number): Effect.Effect<number> => {
  throw new Error("Not implemented");
};

// TODO: Parse s as an integer. Fail with ParseError if it's not a valid integer.
export const parseInteger = (
  s: string,
): Effect.Effect<number, ParseError> => {
  throw new Error("Not implemented");
};
