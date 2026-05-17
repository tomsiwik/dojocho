# SENSEI — Inference vs Training Tradeoff

## Briefing

### Goal

Feel the two knobs Raschka introduces in §1.3 in your hands: spend
compute at **inference time** (sample more) or spend compute at
**training time** (improve weights). Both raise accuracy. They cost
differently, and they fail differently.

You'll build a tiny `MockModel` (a stochastic adder that's right with
probability `p`) and two functions that operate on it: one improves
behavior without touching weights, one improves the weights themselves.

### Tasks

1. Implement `inference_scaling(model, prompt, n_samples)` —
   - Call `model(prompt)` `n_samples` times.
   - Return the most common output (majority vote, ties broken any
     deterministic way).
   - Do NOT touch `model.p` or any internal state.
2. Implement `training_loss(model, examples)` —
   - `examples` is a list of `(prompt, expected_answer)` pairs.
   - For each example, compute `loss = 0 if model(prompt) == expected
     else 1` (using ONE sample, not averaged — that's a separate
     concern handled by the harness).
   - Return the mean loss over the batch: `sum(losses) / len(examples)`.
   - Side effect: bump `model.p` toward 1.0 by a fixed `lr` per
     example correct (this is your "gradient step"). A simple update:
     `model.p = min(1.0, model.p + lr * (1 - loss_per_example))`.
   - Use `lr = 0.01` per correct example.

A `MockModel` is provided in the tests; it has attributes `p` (success
probability) and `lr` (learning rate, default 0.01). Calling
`model(prompt)` returns either the correct answer (with probability
`p`) or a wrong one.

### Hints

- `collections.Counter().most_common(1)[0][0]` gives the majority.
- For deterministic ties, sort the items first, or use Counter's
  built-in (which returns insertion order for ties in CPython 3.7+).
- For `training_loss`, accumulate per-example losses, then bump `p` *as
  you go* so the model improves during the batch (mirrors SGD).

## Prerequisites

- `chain-of-thought-scorer` (previous kata) — you need a way to
  measure "did the model get it right."
- Raschka build-reasoning §1.3 "Improving LLM reasoning with training
  and inference techniques."

## References

- Raschka §1.3 — the three approaches: inference-compute scaling, RL,
  distillation.
- Self-consistency (Wang et al., 2022): https://arxiv.org/abs/2203.11171
  — the canonical "sample N times, majority vote" paper. The next
  kata implements this directly.

## Teaching Approach

**Method: Strong Socratic.** This is conceptual — the student must
*derive* the tradeoff, not be told it.

### Socratic prompts

- "You now have two ways to get a math model from 60% accuracy to 90%.
  Way A: train it on more examples. Way B: sample its answer 10 times
  and majority-vote. **Each one has a different cost.** List one
  advantage and one disadvantage of each."
- "Suppose you ship Way B to production. The model gets 10x more
  expensive *per query*. Now suppose you ship Way A. The model is the
  same cost per query, but you spent $1M training it. Which one wins,
  and on what time horizon?" → no universal answer; depends on query
  volume.
- "Way B works even on a model you didn't train and can't fine-tune
  (closed weights). Way A doesn't. When does that matter?"
- "Run `inference_scaling(model, prompt, 1)` versus
  `inference_scaling(model, prompt, 101)` with `model.p = 0.6`. What
  do you see? Why does it work?" → variance reduction.

### Common pitfalls

1. **Mutating the model inside `inference_scaling`** — the whole point
   is "no weight change." If `model.p` shifts, the function is
   misnamed.
2. **Tie-breaking by random** — tests need a deterministic result on
   ties for a given Counter input order. Don't `random.choice` on
   tied counts.
3. **Averaging the model's output instead of voting** — `mean` of
   strings doesn't make sense. Majority vote = most-common string.
4. **Forgetting to update `model.p` in `training_loss`** — without the
   side-effect, the loss never decreases and the test fails.
5. **Updating `p` *only* at end of batch** — the test expects loss to
   trend down across a single batch. Update per example.

## On Completion

### Insight

You just built tiny versions of the two big levers in reasoning model
development:

- `inference_scaling` is a stand-in for chapter 4's CoT, voting, and
  search.
- `training_loss` is a stand-in for chapter 6's RL and chapter 8's
  distillation.

The reason both work is the same: **more compute, applied somewhere,
buys lower-variance / higher-quality answers.** Where you spend it
changes who pays. Inference scaling pays per query, forever. Training
pays once, then ships.

A subtler observation: `inference_scaling` works on a *frozen*
model. This is why it's the dominant approach for API consumers (you
can't fine-tune GPT-5; you *can* call it 32 times and vote). For lab
researchers with weight access, training methods can compound — every
unit of compute spent on weights helps *every* future inference call.

### Bridge

The next kata, **self-consistency-vote**, drills into the inference-
scaling side: it asks *why* majority voting works at all, and gives
you the weighted version where some samples count more (a confidence-
weighted vote, foreshadowing reward-model voting in chapter 6).
