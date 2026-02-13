import { Config, Effect } from "effect";

/** Read the APP_NAME config as a string */
export const getAppName: Effect.Effect<string> = Effect.fail("Not implemented") as any;

/** Read the PORT config as a number, defaulting to 3000 */
export const getPort: Effect.Effect<number> = Effect.fail("Not implemented") as any;

/** Read both APP_NAME and PORT into an object { name, port } */
export const getAppConfig: Effect.Effect<{ name: string; port: number }> =
  Effect.fail("Not implemented") as any;
