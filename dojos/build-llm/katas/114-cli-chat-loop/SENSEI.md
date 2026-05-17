# SENSEI — cli-chat-loop

## Briefing

### Goal

Integrate the previous three katas into a complete chat REPL. The
function is small — maybe a dozen lines — but it is the shape that
underlies every command-line LLM chat (and, with `input_fn` /
`output_fn` swapped for Chainlit handlers, every browser chat too).

### Tasks

Implement `run_chat(session, input_fn, output_fn, mock_model,
max_turns)`:

1. Loop up to `max_turns` times.
2. Each turn: read input via `input_fn()`. If it is `""` or `"exit"`,
   stop.
3. Append the user message to `session`.
4. Stream tokens from `mock_model(session.messages)`, calling
   `output_fn(token)` for each.
5. Accumulate tokens and commit the full response to
   `session.add_assistant(...)`.

### Hints

- `input_fn`, `output_fn`, and `mock_model` are all injected. Don't
  call `input()` or `print()` — the tests pass mocks.
- This is the streaming-chat pattern, but with `output_fn(tok)` in
  place of `yield tok`.
- "Empty input" means `msg == ""`; "exit" means `msg == "exit"`. Either
  stops the loop.

## Prerequisites

- `chat-session-class`
- `streaming-chat`

## References

- Raschka build-reasoning Appendix G.6.3 ("How the multi-turn script
  uses history") — the same dance, with Chainlit's `chainlit.Message`
  in place of `output_fn`.

## Teaching Approach

**Use-Modify-Create.** The integration *is* the lesson — every piece
you've built shows up. The previous katas drilled the parts in
isolation; this one asks: do they actually compose?

### Socratic prompts (only if the student is stuck)

- "Which kata gave you the part that turns `session.messages` into
  streamed tokens?" (streaming-chat)
- "What does `output_fn` do in production? What about under test?"
  (real: `sys.stdout.write` + `flush`; test: appends to a list)
- "If you wanted to add token-level filtering (drop `<|endoftext|>`),
  where would it go?" (inside the for-loop, before `output_fn`)
- "Where would `truncate_left` plug in?" (between building the prompt
  and calling the model — Raschka does this in Appendix G.6.2)

### Common pitfalls

1. **Calling `input()` instead of `input_fn()`** — tests will hang
   waiting for stdin.
2. **Forgetting the exit conditions** — the test input list ends with
   `"exit"` or `""` to stop the loop; without handling, the loop runs
   `max_turns` times and may IndexError on the mock.
3. **Committing the assistant message before the stream ends** — same
   bug as in streaming-chat. Use a list + `"".join`.
4. **Off-by-one on `max_turns`** — `max_turns=2` means two complete
   turns (user+assistant pairs), not two iterations of an inner loop.

## On Completion

### Insight

You just built the inner loop of every command-line chat tool — and
with two function swaps (`input_fn` → Chainlit's `on_message`,
`output_fn` → `out_msg.stream_token`), the same code is Raschka's
Appendix G multi-turn Chainlit script. The "AI app" abstraction is
this thin.

### Bridge

This is the last kata in the Appendix G mini-track. From here:

- Swap `mock_model` for one of the generation functions from chapters
  2-4 (`generate_text_basic`, `generate_text_basic_stream_cache`).
- Add a real tokenizer-based `count_fn` and call `truncate_left`
  before passing `session.messages` to the model.
- Swap `input_fn` / `output_fn` for a web framework's message handlers
  and you have a deployable chat app.
