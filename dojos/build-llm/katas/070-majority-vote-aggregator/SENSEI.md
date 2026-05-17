# SENSEI — majority-vote-aggregator

## Briefing

### Goal

Build the aggregator at the heart of self-consistency: given a list of
candidate answers, return the most frequent one. Deterministic
tie-break. Empty input returns `""`.

### Tasks

1. Implement `majority_vote(answers)` returning the most common string.
2. Empty list -> `""`.
3. Tie -> alphabetically smallest answer wins.

### Hints

- `collections.Counter` has `.most_common()`. Read its docstring on tie
  ordering before relying on it.
- Sorting `(answer)` by `(-count, answer)` gives you both rules in one
  line.

## Prerequisites

- Kata 001 (bigram language model) — same `Counter` muscle.

## References

- Self-Consistency paper (Wang et al., 2022) — https://arxiv.org/abs/2203.11171
- Raschka, *Build a Reasoning Model From Scratch*, ch. 4

## Teaching Approach

**Method:** Worked example + light Socratic.

### Socratic prompts

- "What does `Counter.most_common()` do when two keys tie? Is the order
  documented, or an implementation detail?"
- "Why does the test require alphabetical tie-break? Why not
  insertion-order, or random?"
- "If your evaluator's tie-break is non-deterministic, what does that
  do to your accuracy numbers across re-runs?"

### Common pitfalls

1. **Trusting `Counter.most_common` for tie order** — it returns
   insertion order on ties (CPython 3.7+), which is *not* alphabetical.
2. **Forgetting the empty case** — `Counter().most_common(1)` returns
   `[]`, then `[0]` raises `IndexError`.
3. **Normalizing inputs** — don't strip/lowercase. The caller decides
   what counts as "the same answer".

## On Completion

### Insight

The "vote" in self-consistency is exactly this — three lines of Python.
The hard part of self-consistency is not voting; it's getting N diverse
samples in the first place (temperature, top-p, parallel decoding). You
just built the post-processing step. The next four katas build out the
rest.

### Bridge

Next kata: `weighted-majority`. Not every vote is equal — what if each
candidate carries a confidence score? Same shape of problem,
fundamentally different assumption about what your model "knows".
