import { Option } from "effect";

/** Convert a nullable value to an Option */
export const fromNullable = <A>(value: A | null | undefined): Option.Option<A> => {
  throw new Error("Not implemented");
};

/** Use Option.match to return "Found: {value}" for Some, "Nothing" for None */
export const describeOption = (opt: Option.Option<string>): string => {
  throw new Error("Not implemented");
};

/** Use Option.map to double the number inside the Option */
export const doubleOption = (opt: Option.Option<number>): Option.Option<number> => {
  throw new Error("Not implemented");
};

/** Use Option.flatMap to safely divide a by b (return None if b is 0) */
export const safeDivide = (a: number, b: number): Option.Option<number> => {
  throw new Error("Not implemented");
};

/** Use Option.getOrElse to extract value or return a default */
export const getOrDefault = (opt: Option.Option<number>, defaultValue: number): number => {
  throw new Error("Not implemented");
};
