# SENSEI — truncation-strategies

## Briefing

### Goal

A chat session grows without bound; the model's context window does
not. Implement three strategies for fitting a `messages` list into a
token budget — each with different fidelity / cost trade-offs.

### Tasks

1. `truncate_left(messages, max_tokens, count_fn)` — drop oldest
   non-system messages first.
2. `truncate_keep_recent(messages, max_tokens, count_fn, n_recent)` —
   keep system + the last `n_recent` messages, dropping further if
   still over budget.
3. `truncate_summarize(messages, max_tokens, count_fn, summarizer)` —
   peel from the front, feed peeled messages to `summarizer`, insert
   one summary message after the original system message.

All three preserve `messages[0]` if it has `role == "system"`.

### Hints

- `count_fn(message)` returns an int; sum it over the list to check the
  budget. In real life this is a tokenizer; the test passes a
  word-count stand-in.
- `truncate_left` is the Raschka Appendix G version (his
  `trim_input_tensor` left-truncates the prompt tensor).
- Build new lists; don't mutate the input. The chat-session-class kata
  owns mutation.
- `n_recent` is a count of messages, not tokens. Cap by count first,
  then by tokens.

## Prerequisites

- `chat-session-class`

## References

- Raschka build-reasoning Appendix G.6.2, Listing G.4 (`trim_input_tensor`).
- Anthropic docs on long-context conversation management
  (summarization strategy).
- HF chat templates — same `messages` shape these functions operate on.

## Teaching Approach

**Constraint variation + Socratic.** Three implementations of "make it
fit"; the lesson is *when to use which*.

### Socratic prompts

- "For a customer-support chatbot where the first message gives the
  account ID, which strategy?" (keep_recent loses it; summarize is
  safer)
- "For a code assistant scrolling through a long refactor, which?"
  (keep_recent — old code is irrelevant once superseded)
- "For a long research conversation, which?" (summarize — cost vs.
  fidelity)
- "Why is the system message sacred? What happens to model behavior if
  you drop it?"

### Common pitfalls

1. **Counting in characters, not via `count_fn`** — the whole point of
   the injected `count_fn` is so this kata doesn't depend on a real
   tokenizer. Use it.
2. **Mutating `messages`** — return a new list. Tests pass the same
   fixture across cases.
3. **`truncate_keep_recent` dropping the system message** when
   `n_recent` exceeds the conversation length. Slice carefully.
4. **`truncate_summarize` infinite loop** when the summary itself
   doesn't shrink the total. Bound the loop: stop when there's nothing
   left to summarize.

## On Completion

### Insight

This is the part of LLM-app engineering nobody screenshots. Production
chat apps tune these strategies per workload — Claude's API even
publishes guidance on prompt-caching-aware truncation. The Raschka
version is literally `input_ids_tensor[:, -keep_len:]` — left-truncate
the token tensor. You just generalized it to the message level and
added two more options.

### Bridge

Next kata, `streaming-chat`, makes the assistant's response *visible
as it generates*. That changes where the in-progress message lives —
not in the session until the stream completes.
