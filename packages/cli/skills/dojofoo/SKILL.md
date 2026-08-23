---
name: dojofoo
description: Use Dojofoo's lesson-scoped teaching tools instead of searching for CLI or harness-specific substitutes.
---

# Dojofoo

Use the lesson's supplied Dojofoo MCP tools. They are already scoped to the current lesson;
do not guess workspace or session IDs, search for commands, or inspect environment variables.

## Tools

- `check_lesson`: run the authored checks. Trust its structured result; do not run a shell command or repeat JSON in chat.
- `present_lesson_fragment`: display an authored interactive fragment by the exact ID given in SENSEI.
- `complete_lesson`: ask the authored Review / Move on / Pause question and wait for the answer.

## Ask the learner

When a kata is complete, call `complete_lesson` and wait for its structured answer.

The tool owns this prompt's wording and choices. Do not print the same choices in chat
before invoking it.

Never invent a question or options for the UI.

For an ordinary open-ended question, speak to the learner normally instead of using
the control surface.

Do not inspect, mention, or attempt a harness-specific AskUser/request_user_input tool.
If a tool fails, report the failure briefly; never invent a replacement workflow.
