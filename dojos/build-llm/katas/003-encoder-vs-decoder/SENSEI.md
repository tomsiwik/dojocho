# SENSEI — 003 Encoder vs Decoder

## Briefing

### Goal

Same data, two prediction tasks. Build directional bigram tables so the
student can frame language modeling either way:

- **Decoder-style** (GPT-like): given the previous word, predict the
  NEXT word. Causal — only the past is visible.
- **Encoder-style** (BERT-like): given a sentence with one word
  HIDDEN, predict the masked word. Bidirectional — both sides are
  visible.

This kata plants the seed of the BERT-vs-GPT distinction. The deeper
mechanical version (attention masking) lands in chapter 3.

### Tasks

1. Implement `build_directional_bigrams(tokens)` — return a
   `(left, right)` tuple of dict-Counters.
   - `right[w]` = Counter of words that come AFTER `w` (forward / GPT).
   - `left[w]`  = Counter of words that come BEFORE `w` (backward / BERT).
2. Implement `predict_next(right, word)` — decoder-style argmax.
   Return `"<unknown>"` if word is missing.
3. Implement `fill_blank(sentence, left, right)`:
   - Input is a list like `["the", "___", "wind"]`.
   - Vote with `right[before]` (what tends to follow the left context)
     and `left[after]` (what tends to precede the right context).
   - Sum the counts; return the argmax.
   - Edge cases: blank at position 0 → use only `left[after]`.
     Blank at last position → use only `right[before]`.
   - If neither side has candidates, return `"<unknown>"`.

### Hints

- `Counter()` supports `.update(other_counter)` for additive merging —
  perfect for combining left+right votes.
- `list.index("___")` finds the blank position.
- `Counter().most_common(1)` → `[(word, count)]`.

## Prerequisites

- Kata 001 (bigrams).

## References

- Raschka chapter 1 §1.4 (transformer architecture intro).
- BERT paper, Devlin et al. 2018 — https://arxiv.org/abs/1810.04805
  (you don't need to read it; the *task* is what matters).

## Teaching Approach

### Socratic prompts

- "If you only know the previous word, you can predict the next one.
  What CAN'T you do without that constraint? (Hint: think about the
  blank in the middle of a sentence.)"
- "When the blank is at position 0, what's the only side you have to
  vote with? At position N-1?"
- "`right[before]` proposes candidates; `left[after]` proposes
  candidates. What happens when you simply add the counts?
  When is that the right move? When is it the wrong move?"
- After it works: "Same data, same statistics. The decoder version was
  the kata 002 model. The encoder version is something a bigram-bigram
  classifier could do. In chapter 3, you'll see the SAME mechanism
  (attention) can be configured either way via a mask. The model is
  the same — the task is what makes it BERT-ish vs GPT-ish."

### Common pitfalls

1. **Off-by-one in left/right** — for the pair `(prev, nxt)`,
   `right[prev]` adds `nxt` and `left[nxt]` adds `prev`. Trace one
   example on paper.
2. **Blank-at-boundary** — `sentence[blank_idx - 1]` when
   `blank_idx == 0` is `sentence[-1]`, which is the LAST element of
   the sentence — a real bug. Guard with `if blank_idx > 0`.
3. **Vote aggregation** — `right[before].update(left[after])`
   REPLACES counts; you want addition. Use `+=` on a third Counter,
   or `Counter() + right[before] + left[after]`.

## On Completion

### Insight

Decoder = "given the past, predict the future." Encoder = "given the
whole context, fill the gap." Same data, same statistics, two
framings. The architecture that makes both feel native is the
transformer with optional causal masking — chapter 3.

### Bridge

Kata 004 turns the sliding-window pattern from a vague idea into a
testable function: take raw text, produce (input, target) training
pairs. This is the data pipeline that connects everything in kata 001-003
to a real training loop (which you'll meet in chapter 5).
