# SENSEI — advantage-normalization

## Briefing

### Goal

Transform raw rewards into **advantages**: a signal that says
"this rollout was *better than average*" (positive) or "*worse
than average*" (negative). You'll implement three modes and feel
why baseline subtraction is so important.

### Tasks

Implement `compute_advantages(rewards, mode: str)` where:

- `rewards`: a 1D `torch.Tensor` of floats.
- `mode`: one of:
  - `"raw"` — return rewards unchanged.
  - `"mean_centered"` — subtract the mean: `r - mean(r)`.
  - `"mean_std_normalized"` — z-score: `(r - mean(r)) / (std(r) + 1e-8)`.
- Return a tensor of the same shape.
- Unknown mode: raise `ValueError`.

### Hints

- `rewards.mean()` and `rewards.std()`. The `+ 1e-8` epsilon
  prevents zero-division when all rewards are equal.
- Use `unbiased=False` for `std` to match the chapter's
  formulation (and so a 1-element input doesn't return NaN).

## Prerequisites

- `policy-gradient-reinforce` — you saw why a constant reward
  gives "push up only" gradients.
- Familiarity with `torch.Tensor` math.

## References

- Raschka build-reasoning ch. 6, sec 6.7 ("Preparing learning
  signals from rollouts via advantages"). The exact formula is
  there: `(r - mean) / (std + eps)`.
- Sutton & Barto, ch. 13.4 ("REINFORCE with Baseline") — the
  classical justification: subtracting a baseline reduces
  variance without changing the expected gradient.

## Teaching Approach

### Method: constraint variation + Socratic

Three modes to **feel** what each transformation does.

### Socratic prompts

1. Before coding: "REINFORCE multiplies log-prob gradient by `R`.
   If `R` is always in `[0, 1]` (like RLVR correctness), every
   gradient has the same sign. What kind of learning signal is
   that?" → Only "push UP". The policy can climb but can't
   demote bad arms. Convergence is glacial.

2. "After subtracting the mean, what does a reward of *exactly
   the mean* contribute?" → Zero gradient. The "average" rollout
   is treated as neutral. Above-average → push up. Below-average
   → push down. Now we have two-sided learning.

3. "Why divide by std too? What problem does that solve?" →
   Scale invariance. If your rewards are all `100, 200, 300` vs
   all `1, 2, 3`, mean-centered gradients differ by 100x but the
   *information* is the same.

4. After it works, look at edge cases: "What does
   `mean_std_normalized` return when all rewards are equal?
   Why is the `1e-8` epsilon there? What if it weren't?" →
   `std = 0`, then `(r - mean) / 0 = NaN`. Epsilon keeps it
   finite (and the result is zero anyway, which is what we want:
   no signal when all rollouts are equally good or bad).

5. "Will mean-centering by itself ever cause numerical problems?"
   → No; it's just subtraction. The epsilon only matters for the
   z-score mode.

### Common pitfalls

1. **Using `unbiased=True`** (the default for `Tensor.std()` in
   older PyTorch) — gives `nan` for length-1 tensors and a
   slightly different formula than the chapter. Always pass
   `unbiased=False` here.
2. **Forgetting epsilon** — silent NaN propagation in training.
   Discovered hours later when loss is `nan` and gradients are
   `nan` and you have no idea where.
3. **In-place ops** — `rewards.sub_(rewards.mean())` mutates the
   caller's tensor. Return a fresh tensor.

## On Completion

### Insight

You just built the simplest possible **baseline**. The whole point
of an advantage is to ask "did this action do better or worse than
what I expected?" — and the simplest expectation is the group
mean. In GRPO, this exact formula is the group-relative advantage
(next kata). In PPO, the "expectation" comes from a learned value
network. In REINFORCE-with-baseline, it's a learned constant.

All three are the same idea: replace `R` with `R - baseline`.

### Bridge

`group-relative-advantage` applies this baseline **per prompt
group**, not across the whole batch. You'll discover why that
matters: it cancels out per-prompt difficulty so the gradient
focuses purely on relative quality.
