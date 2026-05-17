# SENSEI — policy-gradient-reinforce

## Briefing

### Goal

Implement the REINFORCE policy gradient objective for a softmax
policy over 4 arms. The policy is `pi(a) = softmax(logits)[a]`.
The REINFORCE objective to **maximize** is:

```
J = E_{a ~ pi}[ log pi(a) * R(a) ]
```

PyTorch optimizers minimize, so we return the **loss** (negated):

```
loss = - log_pi(action) * reward
```

### Tasks

1. Implement `pg_loss(logits, action, reward) -> torch.Tensor`.
   - `logits`: shape `(4,)`, `requires_grad=True` in tests.
   - `action`: `int` index of the arm that was sampled.
   - `reward`: `float`, the observed reward for that action.
   - Returns a scalar loss tensor whose `.backward()` produces
     the REINFORCE gradient w.r.t. `logits`.

### Hints

- `torch.log_softmax(logits, dim=-1)[action]` is `log pi(action)`.
- Don't differentiate through `reward` — it's an environment
  constant. Plain Python `float` multiplied into a tensor is fine.
- The loss is one expression. If your implementation is more than
  3 lines (excluding the signature), you may be overthinking it.

## Prerequisites

- `bandit-reward` (the environment)
- Comfort with `torch.log_softmax` and `.backward()`.

## References

- Sutton & Barto, ch. 13 (Policy Gradient Methods) — REINFORCE
  derivation. The key identity is `∇ log p(a) = (1/p(a)) ∇ p(a)`,
  often called the log-derivative trick.
- Raschka build-reasoning ch. 6, sec 6.9 — the same objective used
  inside GRPO (sequence-level instead of action-level).

## Teaching Approach

### Method: Strong Socratic

This kata has almost no code — the **why** is the whole lesson.

### Socratic prompts (work through *before* coding)

1. "This loss says: *increase log-prob of high-reward actions,
   decrease log-prob of low-reward actions*. That sounds like
   supervised learning with a target distribution. Why isn't it?"
   → Push them to articulate: the "label" is the action they
   *sampled*, not a ground-truth optimum. The reward, not the
   teacher, decides which way to push.

2. "If `reward` is always positive, this loss will push the
   sampled action's logit up no matter which arm was chosen.
   How does the system still learn to prefer arm 2?"
   → Sampling proportionally to softmax + repeated trials.
   High-reward actions get pushed up *more* on average. This is
   the seed for why we use baselines (kata 3).

3. "Why pass `reward` as a `float` instead of a tensor with
   `requires_grad`?" → REINFORCE treats the reward as a fixed
   environment signal. Backprop should reach `logits`, never
   the reward function. (Foreshadows `.detach()` in kata 5.)

4. After it works: "Imagine `reward` is *negative*. What does
   the gradient do?" → Pushes the action's logit *down*. The
   sign of the reward decides the direction.

### Common pitfalls

1. **Forgetting the negative sign** — REINFORCE *maximizes*
   reward * log-prob. PyTorch minimizes losses. Sign flip!
2. **Using `softmax` then `log`** — numerically worse than
   `log_softmax`. Saves zero arithmetic and bites you on
   small probabilities.
3. **Indexing the wrong dimension** — `logits` here is 1D; in
   the LLM setting it's `(seq, vocab)` and the action is a
   per-position token. Same idea, different shape.

## On Completion

### Insight

You just wrote the line that turns a random sampler into a
learner. The same `-log_pi(a) * R` form is at the heart of
PPO, GRPO, and every modern RLHF method. The differences are:

- GRPO replaces `R` with a group-relative advantage (kata 4).
- PPO adds an importance-sampling ratio and a clip (kata 5).
- LLM versions sum over generated tokens, not a single action.

But the gradient direction is what you just coded.

### Bridge

Kata `advantage-normalization` answers: "If `R` is always
positive, the gradient only pushes UP. How do we get a push-down
signal too?" You'll subtract a baseline and learn why this halves
the variance of the estimator without biasing it.
