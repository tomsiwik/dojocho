import type { ToolCallPart } from "@tanstack/ai-client";
import { useState } from "react";
import {
  AskUserQuestions,
  type AskUserAnswer,
  type AskUserQuestion,
} from "@dojofoo/ui/ask-user-questions";

export function isAgentQuestion(part: ToolCallPart): boolean {
  return isQuestionTool(part) && parseAgentQuestions(part.input).length > 0;
}

export function AgentQuestion({
  className,
  onAnswer,
  questions,
}: {
  className?: string;
  onAnswer: (answers: Record<string, AskUserAnswer>) => void | Promise<void>;
  questions: AskUserQuestion[];
}) {
  const [submitted, setSubmitted] = useState<Record<string, AskUserAnswer> | null>(null);
  return (
    <AskUserQuestions
      answers={submitted ?? undefined}
      className={className}
      disabled={submitted !== null}
      onComplete={(answers) => {
        if (submitted) return;
        setSubmitted(answers);
        void onAnswer(answers);
      }}
      questions={questions}
    />
  );
}

function isQuestionTool(part: ToolCallPart): boolean {
  return /^(elicitation|request_user_input|ask_user(?:_question)?)$/iu.test(part.name);
}

export function parseAgentQuestions(input: unknown): AskUserQuestion[] {
  if (!input || typeof input !== "object") return [];
  const value = input as Record<string, unknown>;
  const raw = Array.isArray(value.questions) ? value.questions : [value];
  return raw.flatMap((question, index) => {
    if (!question || typeof question !== "object") return [];
    const item = question as Record<string, unknown>;
    const options = Array.isArray(item.options) ? item.options : [];
    return [{
      id: String(item.id ?? `answer-${index}`),
      title: String(item.title ?? item.question ?? "Choose an answer"),
      options: options.flatMap((option, optionIndex) => {
        if (!option || typeof option !== "object") return [];
        const choice = option as Record<string, unknown>;
        return [{
          id: String(choice.id ?? choice.label ?? optionIndex),
          title: String(choice.title ?? choice.label ?? `Option ${optionIndex + 1}`),
          ...(typeof choice.description === "string" ? { description: choice.description } : {}),
        }];
      }),
      allowOther: Boolean(item.allowOther),
      freeText: options.length === 0,
    }];
  });
}
