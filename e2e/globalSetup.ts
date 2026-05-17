import { execSync } from "node:child_process";

export async function setup() {
  let state = "";
  try {
    state = execSync(`docker inspect -f '{{.State.Health.Status}}' dojocho-e2e 2>/dev/null`, {
      encoding: "utf8",
    }).trim();
  } catch {
    throw new Error("dojocho-e2e container not found. Run `pnpm e2e:up`.");
  }
  if (state === "healthy") return;
  if (state === "starting") {
    execSync(`docker exec dojocho-e2e sh -c 'for i in $(seq 1 60); do curl -fsS http://127.0.0.1:4000/health >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1'`);
    return;
  }
  throw new Error(`dojocho-e2e container is "${state}". Run \`pnpm e2e:up\` to bring it up.`);
}
