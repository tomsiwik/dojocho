export type SenseiContent = {
  source: string;
  fragments: Record<string, string>;
};

const presentPattern = /<Present\s+id=["']([A-Za-z0-9_-]+)["']\s*>([\s\S]*?)<\/Present>/gu;

/** Split a SENSEI.mdx source into the full private teaching script and addressable learner fragments. */
export function parseSenseiContent(source: string): SenseiContent {
  return {
    source,
    fragments: Object.fromEntries(
      [...source.matchAll(presentPattern)].map((match) => [match[1], match[2].trim()]),
    ),
  };
}

export function senseiFragmentIds(source: string): string[] {
  return Object.keys(parseSenseiContent(source).fragments);
}
