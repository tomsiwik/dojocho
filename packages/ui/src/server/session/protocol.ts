export type JsonRpcId = string | number;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId | null;
  result?: unknown;
  error?: { code: number; message: string };
};

export function result(id: JsonRpcId, value: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result: value };
}

export function error(id: JsonRpcId | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export function notification(method: string, params: unknown): JsonRpcRequest {
  return { jsonrpc: "2.0", method, params };
}

export function parseRequest(text: string): JsonRpcRequest {
  const value = JSON.parse(text) as Partial<JsonRpcRequest>;
  if (value.jsonrpc !== "2.0" || typeof value.method !== "string") {
    throw new Error("Invalid JSON-RPC request");
  }
  return value as JsonRpcRequest;
}
