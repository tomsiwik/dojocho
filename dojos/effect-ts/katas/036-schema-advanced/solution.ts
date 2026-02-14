import { Effect, Schema } from "effect";

/** Define a schema for positive integers using Schema.Number with int() and positive() filters */
export const PositiveInt: Schema.Schema<number> = Schema.Number as any;

/** Define a schema that transforms a string to a Date */
export const DateFromString: Schema.Schema<Date, string> = Schema.String as any;

/** Define a User schema with id (PositiveInt) and name (NonEmptyString) */
export const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

/** Create a decode function for UserSchema */
export const decodeUser = Schema.decodeUnknown(UserSchema);

/** Create an encode function for UserSchema */
export const encodeUser = Schema.encode(UserSchema);
