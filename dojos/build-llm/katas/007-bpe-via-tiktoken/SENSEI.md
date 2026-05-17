# SENSEI — bpe-via-tiktoken

## Briefing

### Goal

Use OpenAI's `tiktoken` library (the production BPE tokenizer behind
GPT-2/3/3.5) and *see* how BPE decomposes unfamiliar words into
subword pieces. No `<|unk|>` token, no crash, no information loss.

This is a small kata in terms of code (≈6 one-liners) but a big one
conceptually — it closes the OOV story V1/V2 left open.

### Tasks

1. `get_encoder()` → `tiktoken.get_encoding("gpt2")`.
2. `encode(text, enc)` → `enc.encode(text)`.
3. `encode_with_endoftext(text, enc)` → use the
   `allowed_special={"<|endoftext|>"}` kwarg.
4. `decode_each(ids, enc)` → list-comprehension calling
   `enc.decode([i])` per id (so you can *see* each subword piece).
5. `decode(ids, enc)` → `enc.decode(ids)`.
6. `vocab_size(enc)` → `enc.n_vocab`.

### Hints

- `enc.encode("Hello")` returns `[15496]` — `Hello` is so common that
  GPT-2's BPE made it one merged token.
- `enc.encode("antidisestablishmentarianism")` returns 5 pieces. Run
  `decode_each` on the result to see exactly which pieces.

## Prerequisites

- `tokenizer-with-special-tokens` — you've seen what `<|unk|>` does and
  why it's lossy. This kata removes the need for it entirely.

## References

- Raschka chapter 2 §2.5 — "Byte pair encoding".
- tiktoken: https://github.com/openai/tiktoken
- The Sennrich et al. (2016) BPE paper: https://arxiv.org/abs/1508.07909

## Teaching Approach

**Method: PRIMM (Predict, Run, Investigate, Modify, Make).** The student
should *predict* outputs before running the tests.

### Socratic prompts

- BEFORE writing code: "How many ids do you expect
  `enc.encode('Hello')` to return? `enc.encode('Helloooo')`?
  `enc.encode('antidisestablishmentarianism')`? Write down your guess."
- After running tests: "You predicted N pieces. The actual answer was
  M. Why is your prediction wrong? What does that tell you about how
  GPT-2's training corpus was shaped?"
- "Run `decode_each(encode('Akwirw ier'))`. The pieces are
  ['Ak', 'w', 'ir', 'w', ' ', 'ier']. Why does BPE split it this way
  and not as ['A', 'k', 'w', 'i', 'r', 'w', ' ', 'i', 'e', 'r']
  (single chars)?"
- "If 'antidisestablishmentarianism' was never in the training corpus,
  where did the ids 415, 29207, 44390, 3699, 1042 come from? What was
  in the training corpus that made *those* ids exist?"
- "V2 needed `<|unk|>`. BPE does not. State the structural reason in
  one sentence." (Target: "BPE's vocabulary covers all bytes, so any
  string is representable as a sequence of in-vocabulary pieces.")

### Common pitfalls

1. **Calling `encode` on text containing `<|endoftext|>` without the
   `allowed_special` kwarg.** tiktoken raises `ValueError` to prevent
   accidental injection. The test asserts this raise.
2. **Using `disallowed_special=()` instead of `allowed_special={...}`.**
   The former *suppresses* the safety check; the latter explicitly
   whitelists the marker. Prefer the explicit form.
3. **Trying to `enc.decode(i)` (single int).** `decode` takes a list.
   For one id: `enc.decode([i])`.

## On Completion

### Insight

You used a tokenizer with vocab size 50,257 — small enough to fit in a
spreadsheet, large enough to represent any string in any language,
without ever emitting `<|unk|>`. That is BPE's contribution to LLMs.

The "magic" is anticlimactic in retrospect: BPE starts from raw bytes
(256 possible values, all guaranteed to round-trip), then iteratively
merges high-frequency byte-pairs into longer pieces, stopping at some
vocab budget. Every word in your training corpus is representable;
every word you've never seen is representable as a concatenation of
shorter pieces.

### Bridge

You now have a real tokenizer (`tiktoken.gpt2`) that turns any text
into a list of integer ids. Next kata wraps it in a PyTorch `Dataset`
(`GPTDatasetV1` from Raschka listing 2.5) that slides a window over
the ids to produce (input, target) training pairs.
