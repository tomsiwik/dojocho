import { askTool } from "./agent";

export function invokeAsk(variant?: string): string {
  const tool = askTool();
  const formatted = tool.includes(" ") ? tool : `\`${tool}\``;
  return variant ? `Invoke ${formatted} (${variant})` : `Invoke ${formatted}`;
}

export function status(fields: Record<string, string>): string {
  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `<dojo:status>\n${body}\n</dojo:status>`;
}

export function sensei(content: string): string {
  return `<dojo:sensei>\n${content}\n</dojo:sensei>`;
}

export function prompt(content: string): string {
  return `<dojo:prompt>\n${content}\n</dojo:prompt>`;
}

export function learnings(content: string): string {
  return `<dojo:learnings>\n${content}\n</dojo:learnings>`;
}
