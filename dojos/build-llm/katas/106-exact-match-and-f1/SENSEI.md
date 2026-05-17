# SENSEI — exact-match-and-f1

## Briefing

### Goal

Implement the two oldest metrics in QA evaluation: **exact match**
(EM) and **token-level F1**. Both come from SQuAD (2016) and remain
the default reporting pair for short-answer benchmarks like TriviaQA
and Natural Questions.

EM is a binary all-or-nothing check after normalization. F1 gives
partial credit by treating the answer as a bag of tokens. They tell
different stories — and the gap between them is often more
informative than either number alone.

### Tasks

1. Implement `normalize(text)`:
   - lowercase
   - remove articles (`a`, `an`, `the`) as whole words
   - strip punctuation
   - collapse whitespace

2. Implement `exact_match(pred, gold)`:
   - returns `1` if `normalize(pred) == normalize(gold)`, else `0`.

3. Implement `f1_score(pred_tokens, gold_tokens)`:
   - `pred_tokens` and `gold_tokens` are lists of strings.
   - Treat each as a multiset (bag).
   - `num_same = sum of min(pred_count, gold_count)` over shared tokens.
   - precision = `num_same / len(pred_tokens)`
   - recall    = `num_same / len(gold_tokens)`
   - return `2 * p * r / (p + r)` (or `0.0` if either is empty / no overlap).

### Hints

- `string.punctuation` + `str.translate` is the cleanest way to strip punct.
- `collections.Counter` supports `&` (multiset intersection); `sum((a & b).values())` is the bag-overlap count in one line.
- Empty edge cases matter — both empty should usually be defined as F1 = 1; one empty should be 0. Pick a convention and test it.

## Prerequisites

None — pure Python and stdlib.

## References

- SQuAD evaluation script (the canonical EM/F1 implementation):
  https://github.com/rajpurkar/SQuAD-explorer/blob/master/evaluate-v2.0.py
- Appendix F (build-reasoning) — verifier-based evaluation context.

## Teaching Approach

**Kata + Socratic on F1's motivation.** The code is short; the value
is in understanding *why both exist*.

### Socratic prompts

- "EM is brutal: `The capital is Paris` vs `Paris` scores 0. What does
  `normalize` exist for? Why don't we just strip everything down to
  letters and call it a day?" (Answer: normalization is the cheap fix
  for trivial formatting noise. F1 is the structural fix for partial
  answers.)
- "F1 treats the answer as a bag of tokens. What information does it
  throw away?" (Word order, syntax, negation. `not guilty` and `guilty
  not` get the same F1 against `not guilty`.)
- "When is partial credit a feature? When is it a bug?" (Feature:
  list-style questions, multi-fact answers. Bug: math (`42` vs `2.4`
  shouldn't get F1 = 0.5 just because of digit overlap), classification
  (label is atomic).)
- "Your evaluation reports EM = 30%, F1 = 75%. What does that gap tell
  you?" (Model usually contains the right tokens but adds extra
  framing — verbose model, format mismatch, or wrapper sentence.)
- "Why did SQuAD use F1 instead of BLEU?" (Short answers — BLEU's
  n-gram precision is degenerate at length 1-3. F1 on unigrams is
  the natural fallback.)

### Common pitfalls

1. **Removing articles as substrings** — `"that"` contains `the`.
   Tokenize first, then filter, then rejoin. Or use word-boundary
   regex.
2. **Division by zero** — if `pred_tokens` is empty (model refused),
   precision is undefined. Return 0.0.
3. **Multiset vs set** — `["the", "the"]` vs `["the"]` should give
   precision 0.5, not 1.0. Use `Counter`, not `set`.

## On Completion

### Insight

You've implemented the metric pair every QA leaderboard from 2016 to
about 2022 reported. They're cheap, deterministic, and reproducible
— and they fail exactly where reasoning models shine: long answers,
multiple valid phrasings, free-form explanations. That failure mode
is what motivates the next three katas (Elo, Bradley-Terry, LLM
judges).

### Bridge

Next: **elo-rating** and **bradley-terry-rating** — when EM/F1 break
down because there's no single gold answer, we rank models against
each other instead. Same shift human chess made in 1960.
