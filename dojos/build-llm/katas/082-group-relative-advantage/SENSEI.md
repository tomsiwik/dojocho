# SENSEI — group-relative-advantage

## Briefing

### Goal

GRPO's defining feature: advantages are normalized **within
each group of rollouts** for the same prompt, not across the whole
batch. You'll implement this per-group normalization and discover
why it's the right thing to do for LLMs.

### Tasks

Implement
`group_relative_advantage(rewards: list[float], group_size: int) -> list[float]`
that:

1. Splits `rewards` into consecutive chunks of size `group_size`
   (assume `len(rewards) % group_size == 0`).
2. For each group, computes z-scored advantages:
   `(r - mean(group)) / (std(group) + 1e-8)`.
3. Returns the flattened list of advantages in the same order.

If `group_size == 1`, each group has zero std; return `0.0` for
every element (the epsilon makes this fall out automatically).

### Hints

- You can use `torch.tensor(group).std(unbiased=False)` per group,
  or implement it in pure Python. The chapter's reference uses
  PyTorch tensors.
- Reuse the formula from `advantage-normalization`. The only new
  thing here is the *grouping*.

## Prerequisites

- `advantage-normalization` (you'll reuse its z-score formula).
- Comfort with list/tensor slicing.

## References

- Raschka build-reasoning ch. 6, sec 6.7 — "The 'GR' (group
  relative) in GRPO refers to the fact that GRPO generates
  multiple answers (rollouts) per prompt, and compares them
  relative to each other to construct a learning signal."
- GRPO paper (DeepSeekMath), <https://arxiv.org/abs/2402.03300>
  — equation defining group-relative advantage.

## Teaching Approach

### Method: code-reading + Socratic

### Setup (do this first)

Read sections 6.5 ("Sampling rollouts") and 6.7 ("Preparing
learning signals from rollouts via advantages") in chapter 6.
You don't need to type any of it — just see the shape of the
GRPO loop: prompt → N rollouts → N rewards → advantages.

### Socratic prompts

1. "GRPO calls it the *group-relative* advantage. Why per-group?
   What goes wrong if you normalize across the whole batch instead
   of per-prompt?"
   → Different prompts have wildly different difficulty. An easy
   prompt where all rollouts get reward 1, and a hard one where
   all get 0 — across a batch, the easy ones are "above average"
   and the hard ones "below average". But that's not a signal
   about *the model's choices* — it's a signal about *prompt
   difficulty*. Per-group cancels difficulty out: each prompt
   gets its own zero baseline.

2. "What does the advantage equal when all rollouts in a group
   get the same reward (e.g., all correct, or all wrong)?"
   → Zero. Hence zero gradient. The model learns *nothing* from
   that prompt this step — which is correct, because there's no
   relative signal to learn from. (See exercise 6.2 in the
   chapter.)

3. "Look at group_size=1. Why does this make sense (zero
   advantage), and why is GRPO *useless* with group_size=1?"
   → With a single rollout, there's no relative comparison to
   make. GRPO needs `>= 2` rollouts per prompt to produce any
   signal. The chapter's `compute_grpo_loss` even asserts
   `num_rollouts >= 2`.

4. "Why is the *output a list of N numbers* (one per rollout),
   not a single number per group?" → Because each rollout's
   advantage scales its own log-prob gradient.

### Common pitfalls

1. **Forgetting to flatten back** — students sometimes return a
   list-of-lists. Tests expect a flat list of length `N`.
2. **Using `unbiased=True` std** — for a 2-element group with
   identical values, biased std is 0 (we want this); unbiased
   std is `nan`. Use `unbiased=False`.
3. **Mutating `rewards`** — pass through a tensor or fresh list.
4. **Off-by-one on group boundaries** — if `len(rewards)` isn't a
   multiple of `group_size`, behavior is undefined. The kata tells
   you to assume it divides cleanly; the test won't violate this.

## On Completion

### Insight

Per-group normalization is what makes GRPO **value-free**: PPO
needs a learned value network `V(s)` to compute advantages, and
that value network is roughly the same size as the policy.
GRPO replaces `V(s)` with the group mean. That's it. Halves the
model count for training and removes a whole class of bugs.

The cost: you need to generate `N >= 2` rollouts per prompt
*every step*. The trade is "extra forward passes" for "no value
model". For LLMs, that's usually a great trade because the value
model is itself an LLM.

### Bridge

`grpo-loss` combines (1) advantages and (2) log-probs with a new
ingredient — the **clipped importance ratio** — to handle the case
where the policy you sample from drifts away from the policy you
update. That's how you safely re-use rollouts and bound the size
of each policy step.
