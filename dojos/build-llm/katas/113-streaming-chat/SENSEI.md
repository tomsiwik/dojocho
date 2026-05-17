# SENSEI — streaming-chat

## Briefing

### Goal

Wrap a token-by-token model stream so that:

1. The caller (a UI loop) receives each token as it is produced.
2. The session gets updated with the *full* assistant message only
   after the stream is exhausted.

This is the pattern every chat UI uses — ChatGPT, Claude.ai, Cursor,
and Raschka's Chainlit example all do this dance.

### Tasks

Implement `chat_stream(session, mock_model) -> Iterator[str]` that:

- Calls `mock_model(session.messages)` to get a token generator.
- `yield`s each token to its caller.
- Accumulates tokens, then calls `session.add_assistant(full_text)`
  *once*, after the stream ends.

### Hints

- This is a generator function. `yield` inside `chat_stream`.
- `"".join(tokens_collected)` builds the final string.
- The `add_assistant` call must happen *after* the `for tok in
  mock_model(...): yield tok` loop completes. If you append before
  yielding, the message is in `session.messages` while still partial.

## Prerequisites

- `chat-session-class`

## References

- Raschka build-reasoning Appendix G.4, Listing G.2 (`for tok in
  generate_text_basic_stream_cache(...): await out_msg.stream_token(piece)`).
- Python generators / `yield` —
  https://docs.python.org/3/reference/expressions.html#yield-expressions

## Teaching Approach

**Worked example + Socratic.** The shape is small but the temporal
reasoning matters — when does the partial response exist, and where?

### Socratic prompts

- "Streaming yields tokens before the full response is known. Where in
  your session does the partial response live?" (Answer: nowhere —
  it's accumulating in a local variable inside `chat_stream`.)
- "If you appended the assistant message first and mutated it as
  tokens arrived, what would happen if the user opened a second
  browser tab reading the same `session.messages`?"
- "Why a generator and not a list? What does the UI gain?"
  (Time-to-first-token: the user sees output ~50ms after enter,
  instead of waiting seconds for the whole response.)

### Common pitfalls

1. **Appending the assistant message before yielding** — breaks the
   "no half-baked message in session" invariant.
2. **Returning a list instead of yielding** — the function must be a
   generator. The caller does `for tok in chat_stream(...)`.
3. **Concatenating with `+=` on a str in a hot loop** — works for this
   kata (tokens are short) but use a list and `"".join` for the habit.
4. **Forgetting to commit at all** — the stream runs, the UI paints,
   the next turn finds no record of the assistant's reply in session.

## On Completion

### Insight

You wrote the streaming primitive every chat app uses. The same shape
applies to OpenAI's `stream=True`, Anthropic's `client.messages.stream`,
and Raschka's Qwen3 `generate_text_basic_stream_cache`. The contract
is: *yield tokens for display, accumulate locally, commit once at the
end*. Mistakes here cause the classic "the chat shows my message twice"
or "the previous reply is missing" bugs in production chat UIs.

### Bridge

The final kata, `cli-chat-loop`, wires everything together: a
`ChatSession`, a streaming model, an input function, an output
function — a complete REPL in 15 lines.
