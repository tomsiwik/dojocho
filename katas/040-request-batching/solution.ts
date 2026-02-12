import { Effect, Request, RequestResolver } from "effect";

export interface GetUser extends Request.Request<string, string> {
  readonly _tag: "GetUser";
  readonly id: number;
}

export const GetUser = Request.tagged<GetUser>("GetUser");

/** Create a batched resolver that receives all requests at once,
 * calls the lookup function with all IDs, and resolves each request */
export const makeUserResolver = (
  lookup: (ids: number[]) => Effect.Effect<Map<number, string>>,
): RequestResolver.RequestResolver<GetUser> => {
  throw new Error("Not implemented") as any;
};

/** Make a single user request using Effect.request */
export const getUser = (
  id: number,
  resolver: RequestResolver.RequestResolver<GetUser>,
): Effect.Effect<string, string> => {
  throw new Error("Not implemented");
};

/** Make multiple user requests with batching enabled */
export const getUsers = (
  ids: number[],
  resolver: RequestResolver.RequestResolver<GetUser>,
): Effect.Effect<string[], string> => {
  throw new Error("Not implemented");
};
