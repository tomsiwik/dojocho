import { downloadTemplate } from "giget";

export type RemoteDojoSource = "github" | "url";

export function gigetLocator(source: string, type: RemoteDojoSource): string {
  return type === "github" ? `gh:${source}` : source;
}

export async function acquireRemoteDojo(
  source: string,
  type: RemoteDojoSource,
  directory: string,
): Promise<string> {
  const result = await downloadTemplate(gigetLocator(source, type), {
    dir: directory,
    force: false,
    install: false,
  });
  return result.dir;
}
