# SENSEI — chat-session-class

## Briefing

### Goal

Build the data structure every chat LLM consumes: an ordered list of
`{role, content}` messages with a system prompt always in front. This is
the spine of Appendix G. Everything else (truncation, streaming, the CLI
loop) operates on this list.

### Tasks

1. Implement `ChatSession.__init__(self, system_prompt)` — seed
   `self.messages` with one system message.
2. Implement `add_user(msg)` and `add_assistant(msg)` — each appends
   one dict with the right `role` to `self.messages`.

### Hints

- A message is literally `{"role": "user", "content": "..."}`. Don't
  invent a class for it — Anthropic / OpenAI / HuggingFace all use
  plain dicts.
- `self.messages = []` belongs in `__init__`, not at class scope. A
  mutable class attribute is shared across instances — see the
  `test_independent_sessions` test.

## Prerequisites

None — this is the first kata in the Appendix G chat-interface
mini-track.

## References

- HF chat templates — https://huggingface.co/docs/transformers/chat_templating
- Raschka build-reasoning Appendix G.6.3 ("How the multi-turn script
  uses history") — Chainlit stores `history` as exactly this list.

## Teaching Approach

**Kata + Socratic on the seams.** The class is small; the interesting
question is where state lives.

### Socratic prompts

- "Where in your data structure does the user message live *before* the
  model has responded?"
- "Where does the model's partial response live during streaming?"
  (foreshadowing the streaming-chat kata)
- "Why is the system message at index 0 and not, say, a separate
  attribute? What does the chat API expect?"
- "If you wanted to fork the conversation (`what if I had said X
  instead?`), what would you copy?"

### Common pitfalls

1. **Class-level `messages = []`** — Python evaluates the default once.
   Two `ChatSession` instances end up sharing the same list. Put it in
   `__init__`.
2. **Returning the message** from `add_user`/`add_assistant` instead of
   appending. The tests don't check return values, but later katas rely
   on mutation.
3. **Storing the system prompt as a string attribute** and exposing it
   separately from `messages`. The whole point is that the model sees
   one list — system message included.

## On Completion

### Insight

You just built the universal chat-API shape. Every chat LLM since
GPT-3.5 — Claude, Gemini, Qwen, Llama — accepts a list of
`{role, content}` messages. The role strings are stable: `system`,
`user`, `assistant`, plus `tool` for function calling. This is the
contract; the rest of Appendix G is what you do with it.

### Bridge

Next kata, `truncation-strategies`, asks: what happens when the list
grows past the model's context window? Three answers — chop the oldest,
keep the most recent N, summarize the middle — each with different
behavior for different apps.
