export type FormattedThinkingStep = { label?: string; content?: string };

const headingPattern = /^\*\*([^*\n]+)\*\*$/u;

export function formatThinkingSteps(text: string): FormattedThinkingStep[] {
  const normalized = text.trim();
  if (!normalized) return [];
  const heading = normalized.match(headingPattern);
  return heading ? [{ label: heading[1].trim() }] : [{ content: text }];
}
