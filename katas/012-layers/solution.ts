import { Context, Effect, Layer } from "effect";

export class Config extends Context.Tag("Config")<
  Config,
  { readonly baseUrl: string }
>() {}

export class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (msg: string) => Effect.Effect<void> }
>() {}

/** Create a Layer that provides Config with baseUrl "https://api.example.com" */
export const ConfigLive: Layer.Layer<Config> = Layer.effectDiscard(
  Effect.die("Not implemented"),
) as unknown as Layer.Layer<Config>;

/** Create a Layer that provides Logger with a log function that uses Effect.log */
export const LoggerLive: Layer.Layer<Logger> = Layer.effectDiscard(
  Effect.die("Not implemented"),
) as unknown as Layer.Layer<Logger>;

/** Create a program that reads Config.baseUrl and Logger.log to return "{baseUrl}/users" */
export const getEndpoint = Effect.gen(function* () {
  throw new Error("Not implemented");
});
