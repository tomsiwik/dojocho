# SENSEI — tokenizer-with-special-tokens (SimpleTokenizerV2)

## Briefing

### Goal

Extend V1 → V2 (Raschka listing 2.4) by adding `<|unk|>` and
`<|endoftext|>` to the vocabulary. V2 never crashes — OOV words become
`<|unk|>`, document boundaries become `<|endoftext|>`.

The kata makes two points concrete:

1. The fix is one line in `encode`: `t if t in vocab else "<|unk|>"`.
2. The fix is lossy — decode("Hello") returns "<|unk|>", not "Hello".
   You've solved "the model crashes" but not "the model knows what the
   word was."

### Tasks

1. Implement `build_vocab_v2(tokens)` — sorted base tokens + the two
   specials APPENDED (so they get the two largest ids).
2. Implement `SimpleTokenizerV2` with `__init__`, `encode`, `decode`.
   - `encode` must let `<|endoftext|>` pass through as a single token,
     NOT decompose it into `<`, `|`, `endoftext`, `|`, `>`.
   - Easiest approach: split on `<|endoftext|>` first, then tokenize
     each piece, then re-interleave.

### Hints

- The regex from V1 still does the bulk of the work — reuse it.
- For OOV mapping: list comprehension is cleanest.
- For the endoftext marker, `text.split("<|endoftext|>")` is your
  friend. Build the token list interleaving marker tokens between
  chunks.

## Prerequisites

- `simple-regex-tokenizer` — you reuse the same regex and the same
  decode pattern.

## References

- Raschka chapter 2 §2.4 — "Adding special context tokens".
- Listing 2.4 — `SimpleTokenizerV2`.

## Teaching Approach

**Method: Use-Modify-Create + Socratic on the tradeoff.** The student
copies V1, modifies two methods, and creates a new vocab builder. The
key teaching moment is at the *end*, when the round-trip is visibly
lossy.

### Socratic prompts

- Before coding: "Look at your V1 `encode`. Where exactly does the
  KeyError happen? What's the minimum change to make that line not
  throw?"
- After tests pass: "You added `<|unk|>`. The OOV problem is *solved*
  in the sense that the model no longer crashes. But is the model
  actually learning anything about a word it tokenizes as `<|unk|>`?
  What did you trade for not crashing?"
- "Two different OOV words — say 'Hello' and 'palace' — get the same
  id. Inside the model, will they ever produce different predictions
  downstream? Why or why not?"
- "How big would the vocabulary need to be to never produce
  `<|unk|>` on English text? On English + code? On English + code +
  emoji? Now you see why BPE exists."

### Common pitfalls

1. **Putting specials BEFORE the sorted base.** If `<|endoftext|>`
   gets id 0, every downstream id shifts. Append, don't prepend.
2. **Tokenizing `<|endoftext|>` with the regex.** The pipes and
   angle-brackets are in the regex's special char set — the marker
   gets shredded. Split on the literal marker FIRST.
3. **Stripping the marker in the cleanup step.** `item.strip()` on
   `'<|endoftext|>'` returns `'<|endoftext|>'` (no surrounding ws), so
   this is usually safe — but only if you didn't put it through the
   regex.
4. **Forgetting that the test asserts a SINGLE endoftext id.** A list
   of 5 unk-ids would silently look "kind of right" but is wrong.

## On Completion

### Insight

You patched the OOV crash with one line and shipped two special
tokens. The model no longer crashes on novel input — but it also
cannot tell "Hello" from "palace": both are just `<|unk|>` to it.

This is the central limitation of word-level tokenization, and the
reason no production LLM uses it. The next kata introduces BPE, which
represents "Hello" as actual subword pieces (`Hello` → `[Hello]` if
common, or `[Hel, lo]`, or even `[H, ell, o]` if rare), so the model
can read words it has never seen during training.

### Bridge

Next: `bpe-via-tiktoken`. You'll use OpenAI's `tiktoken` library to
tokenize `"antidisestablishmentarianism"` and see exactly how BPE
decomposes it — no `<|unk|>` in sight.
