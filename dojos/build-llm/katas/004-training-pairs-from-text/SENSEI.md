# SENSEI — 004 Training Pairs from Text

## Briefing

### Goal

You've built a "model" that predicts the next word. Now build the
**data pipeline** that turns one long text into many (input, target)
pairs — the kind a real training loop consumes.

This is the **sliding-window** trick from chapter 2, in its purest
form. It is also where self-supervision becomes concrete: the target
for input `tokens[i:i+max_len]` is `tokens[i+1:i+1+max_len]`, shifted
by one. **The labels are in the data itself.**

### Tasks

1. Implement `tokenize_to_ids(text, vocab)` — return a list of integer
   IDs. `vocab` is `dict[str, int]`. Unknown words map to `vocab["<unk>"]`
   if present, else raise `KeyError`.
2. Implement `build_vocab(tokens, include_unk=True)` — return
   `dict[str, int]` mapping each unique token to a unique ID, sorted
   alphabetically (so the assignment is deterministic). Reserve ID 0
   for `<unk>` if `include_unk` is True.
3. Implement `sliding_window_pairs(ids, max_length, stride)`:
   - Yield `(input_chunk, target_chunk)` tuples (both length
     `max_length`).
   - `target_chunk` is `input_chunk` shifted right by one.
   - Step forward by `stride` between chunks.
   - Stop when there isn't enough remaining text for both an input and
     its shifted target.

### Hints

- `tokens[i : i + max_length]` is the input chunk.
- `tokens[i + 1 : i + 1 + max_length]` is the target chunk.
- The last valid `i` is `len(tokens) - max_length - 1`.
- `range(0, last_i + 1, stride)` iterates valid starts.

## Prerequisites

- Kata 001 (tokenize is the same pattern, just outputting IDs).
- Kata 002 (you've seen what (input → target) means at the model end;
  now you build it at the data end).

## References

- Raschka chapter 2 §2.5 — "Sampling with a sliding window".
- `LLMs-from-scratch/ch02/01_main-chapter-code/gpt_dataset.py` for the
  real PyTorch `Dataset` version (kata 014 uses this directly).

## Teaching Approach

### Socratic prompts

- "You have `tokens = [a, b, c, d, e, f, g]` and `max_length=4`. What
  are all the (input, target) pairs at `stride=1`? At `stride=2`?
  At `stride=4`?"
- "Why `tokens[i+1:i+1+max_length]` and not just `tokens[i+max_length]`?"
  (Answer: you want a parallel target per position, not just the very
  next token — that lets the model learn `max_length` next-token
  predictions per training example.)
- "What's the LAST valid `i`? Off-by-one is the most common bug here —
  trace it with the smallest possible inputs."
- "If `stride < max_length`, what does the model see twice? If
  `stride > max_length`, what does it never see?"

### Common pitfalls

1. **Off-by-one** — `range(0, len(ids) - max_length + 1, stride)` is
   WRONG (the target would walk off the end). It must be
   `range(0, len(ids) - max_length, stride)`.
2. **Returning the iterator twice** — `yield` is fine; if you use
   `return`, return a list, not a generator (the test consumes it
   twice).
3. **Vocab determinism** — if `build_vocab` returns different IDs on
   different runs, tests that compare exact IDs will flake. Sort the
   keys.
4. **`<unk>` placement** — reserve ID 0 for `<unk>` BEFORE assigning
   IDs to real tokens, otherwise you shift the entire ID space.

## On Completion

### Insight

Self-supervision in three lines:
`(input, target) = (tokens[i:i+L], tokens[i+1:i+1+L])`.
No human labeled anything. The "label" is just *the same text shifted
by one*. This is why you can pretrain on every token of the entire
internet.

You've now built both ends of a tiny training pipeline:
- A model (`build_bigrams` / `next_word`) — kata 001-003.
- A data pipeline (this kata) — produces (input, target) pairs from
  raw text.

The missing piece is the **loss** and **optimizer** that connect them.
That's chapter 5 (kata 061+).

### Bridge

You've finished build-llm chapter 1. White-belt time.

Kata 005 starts chapter 2 (Working with text data) by upgrading your
whitespace tokenizer to one that handles punctuation and unknown
words — i.e., the kind that would survive being deployed.
