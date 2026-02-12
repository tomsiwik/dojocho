import { Context, Effect, Layer } from "effect";

export class Database extends Context.Tag("Database")<
  Database,
  { readonly query: (sql: string) => Effect.Effect<string> }
>() {}

// TODO: Create a Layer.scoped that:
// - acquires a "connection" (log "db:connected" to the log array)
// - provides a Database service whose query returns "result:{sql}"
// - releases by logging "db:disconnected"
export const DatabaseLive = (log: string[]): Layer.Layer<Database> =>
  Layer.fail("Not implemented" as any);

// TODO: Use the Database service to run a query
export const runQuery = (sql: string) =>
  Effect.gen(function* () {
    throw new Error("Not implemented");
  });
