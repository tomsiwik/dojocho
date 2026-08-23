import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import autoScroll from "./cassettes/auto-scroll.jsonl?raw";
import chainedTools from "./cassettes/chained-tools.jsonl?raw";
import freeText from "./cassettes/free-text.jsonl?raw";
import multipleChoice from "./cassettes/multiple-choice.jsonl?raw";
import thinkingIndicator from "./cassettes/thinking-indicator.jsonl?raw";
import thoughtsAndTools from "./cassettes/thoughts-and-tools.jsonl?raw";
import { ChatCassettePlayer } from "./chat-cassette";

const meta = {
  title: "Chat/Streaming cassettes",
  component: ChatCassettePlayer,
  args: {
    autoPlay: true,
    onAnswer: fn(),
    onComplete: fn(),
    onFrame: fn(),
    speed: 0.5,
  },
  argTypes: {
    cassette: { table: { disable: true } },
    autoPlay: { control: "boolean" },
    speed: { control: "select", options: [0.5, 1, 2, 4] },
    onAnswer: { action: "answered" },
    onComplete: { action: "stream completed" },
    onFrame: { action: "frame emitted" },
  },
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
} satisfies Meta<typeof ChatCassettePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleChoice: Story = { args: { cassette: multipleChoice } };
export const FreeTextQuestion: Story = { args: { cassette: freeText } };
export const ThoughtsAndTools: Story = { args: { cassette: thoughtsAndTools } };
export const ChainedToolsWithoutResponse: Story = { args: { cassette: chainedTools } };
export const ThoughtIndicator: Story = { args: { cassette: thinkingIndicator } };
export const AutoScroll: Story = { args: { cassette: autoScroll } };
