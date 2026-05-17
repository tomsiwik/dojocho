# SENSEI — Self-Consistency Vote

## Briefing

### Goal

Implement the kernel of *self-consistency decoding* (Wang et al., 2022)
in 20 lines: take a bag of candidate answers from a stochastic model
and return the most-voted one. Then implement the **weighted** version,
where some samples are more confident than others — the basis for
reward-model voting and verifier-weighted decoding you'll meet in
chapter 6.

This kata closes chapter 1: you've gone from "what is reasoning"
(kata 1) to "how do we score it" (kata 2) to "two ways to improve it"
(kata 3) to "the specific inference-time technique that defines the
state of the art" (this kata).

### Tasks

1. Implement `majority_vote(answers: list[str]) -> str` — count
   occurrences and return the most common. Tie-break deterministically
   (e.g., lexicographic among the top-tied).
2. Implement `weighted_majority(answers_with_weights: list[tuple[str, float]]) -> str` —
   sum weights per answer string, return the one with the highest sum.
   Tie-break the same way.

### Hints

- `collections.Counter` gives you `majority_vote` in two lines.
- For `weighted_majority`, use a `defaultdict(float)` keyed by answer.
- Deterministic tie-break: among the answers tied for the maximum count
  or weight, return the lexicographically smallest. This makes tests
  reproducible without forbidding ties.

## Prerequisites

- `inference-vs-training-tradeoff` (previous kata) — you implemented
  un-weighted majority voting as `inference_scaling`. This kata
  extracts and generalizes that idea.
- Raschka build-reasoning §1.3 (inference-compute scaling).

## References

- Wang et al., *Self-Consistency Improves Chain of Thought Reasoning in
  Language Models* (2022): https://arxiv.org/abs/2203.11171
  — the paper that turned "sample once" into "sample N, vote." Read
  the abstract and §1; the rest is empirical curves.
- Raschka, *Build a Reasoning Model (From Scratch)*, §1.3 — names
  inference-compute scaling as one of three reasoning techniques.

## Teaching Approach

**Method: Worked example + Socratic.**

### Worked example to walk through first

Before any tests, sketch this on paper with the student:

```
Model M solves "23 + 19" five times, sampling at temperature > 0:
   ["42", "42", "41", "42", "43"]

majority_vote(answers) == "42"
```

Then ask why it works. Don't accept "because 42 is the most common" —
that's the *what*. Ask why the model produces multiple answers in the
first place, and why the majority is more often right than any
individual sample.

### Socratic prompts

- "Majority voting beats single-shot. Why? You're using **more
  compute** — fine. But is *more compute* the only reason it works?"
  → variance reduction: independent noisy estimates concentrate on the
  true value (weak law of large numbers, but it's enough that the
  *modal* answer be more likely than 1/N).
- "When does majority voting *not* help? When can it actively hurt?"
  → when the model is *systematically* wrong (mode is the wrong
  answer). Voting won't fix bias, only variance.
- "Weighted voting overrides simple count. When would you weight a
  sample more? Give two scenarios from the reasoning literature."
  → confidence (model log-prob), verifier reward, longer reasoning
  trace (Wang's "self-consistency" originally used reasoning-chain
  diversity).
- "If you weight every sample by `1.0`, weighted_majority and
  majority_vote agree. Prove it from your code."

### Common pitfalls

1. **Non-deterministic tie-break** — `Counter.most_common(1)` returns
   *insertion order* on ties. That's fine *if* tests pass deterministic
   input, but the safer pattern is to explicitly tie-break with
   `min(..., key=lambda x: (-count, answer))`.
2. **Treating `weights` as ints** — they're floats; sum them as floats.
3. **Returning the count instead of the answer** — `majority_vote`
   returns the *string answer*, not its count.
4. **Crashing on empty list** — not strictly tested for, but
   defensible: return `""` or raise.

## On Completion

### Insight

You've implemented the kernel of every modern voting/self-consistency
scheme in 20 lines. The unweighted version is the original Wang et al.
self-consistency. The weighted version is what every paper on verifier-
guided decoding, process reward models (PRMs), and best-of-N voting
ultimately reduces to.

Two non-obvious takeaways:

- **Voting reduces variance, not bias.** If the model is systematically
  wrong, voting confidently returns the wrong answer. This is why
  ch4–ch5 spend so much time on *diverse* sampling (temperature,
  nucleus, distinct prompts) — diversity is what makes the samples
  independent enough for variance to actually drop.
- **Weight selection is the whole game.** Once you have the weighted
  vote, the research question becomes "where do good weights come
  from?" Answers: log-probs (cheap, weak), verifiers (expensive,
  strong), process rewards (very expensive, very strong). Chapter 6
  trains the verifier.

### Bridge

Chapter 2 of build-reasoning loads a real pre-trained Qwen3 model.
You'll move from `MockModel(p=0.7)` to an actual LLM emitting actual
tokens, and re-use the scoring primitive (`score`) and voting
primitive (`majority_vote`) you built in this chapter to evaluate it.
The chapter 1 katas are the harness; chapter 2 plugs in the engine.
