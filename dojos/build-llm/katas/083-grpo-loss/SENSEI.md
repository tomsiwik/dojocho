# SENSEI — grpo-loss

## Briefing

### Goal

Implement the full **clipped** GRPO/PPO surrogate loss for a
single (action, advantage) sample. This is the form that lets you
take multiple gradient steps from the same batch of rollouts
without the policy running away from the rollout distribution.

For a single sample, with `logits_old` (the policy that produced
the rollout) and `logits_new` (the current policy being updated):

```
log_prob_old = log_softmax(logits_old)[action]   # detached
log_prob_new = log_softmax(logits_new)[action]
ratio        = exp(log_prob_new - log_prob_old)
clipped      = clamp(ratio, 1 - eps, 1 + eps)
loss         = - min(ratio * A, clipped * A)
```

Where `A` is the **detached** advantage scalar.

### Tasks

Implement
`grpo_loss(logits_old, logits_new, action, advantage, clip_eps) -> torch.Tensor`
that:

1. Computes both log-probs with `log_softmax`.
2. **Detaches** `log_prob_old` and `advantage` so gradients only
   flow into `logits_new`.
3. Computes the ratio and clipped ratio.
4. Returns `-min(ratio*A, clipped*A)` as a scalar tensor.

### Hints

- `torch.clamp(ratio, 1 - eps, 1 + eps)`.
- `torch.min(a, b)` (NOT `torch.minimum`'s old gotchas — `min`
  with two tensors works).
- `.detach()` is mandatory on `advantage`. The chapter highlights
  this explicitly (section 6.9: "we use .detach() on the advantages
  because they are treated as fixed learning signals").
- The minimum is the **lower bound** trick: when the ratio
  drifts outside `[1-eps, 1+eps]` *in the direction that would
  exploit the surrogate*, the clip kicks in.

## Prerequisites

- `policy-gradient-reinforce` (you wrote `-log_pi * R`)
- `group-relative-advantage` (you'll be passing `A` in)
- Read GRPO paper section 4.1: <https://arxiv.org/abs/2402.03300>

## References

- Raschka build-reasoning ch. 6, sec 6.9-6.10. (NOTE: chapter 6
  omits the clip for pedagogy; the paper and chapter 7 add it
  back. This kata is the full clipped form.)
- PPO paper, Schulman et al. 2017, sec 6.1 — the clipping
  trick was introduced for PPO and GRPO inherits it.

## Teaching Approach

### Method: Parsons + Strong Socratic

The shape of the formula is given; the *order* of operations
and the placement of `.detach()` calls is the point.

### Socratic prompts

1. "Why is there a `ratio` at all? REINFORCE just had
   `-log_pi(a) * R`."
   → Because in GRPO you might do multiple SGD steps on the same
   batch of rollouts. After the first step, the policy you sample
   from (`old`) is *not* the policy you're updating (`new`). The
   importance ratio corrects for this drift. With just one SGD
   step per rollout, `ratio == 1` and the loss reduces to
   `-A * log_pi_new` (REINFORCE with advantage).

2. "Why `.detach()` on `advantage`? What would happen if you
   *didn't* detach it?"
   → The advantage is derived from `rewards`, which (in toy
   bandit case) is a Python float — `.detach()` would be a no-op.
   But in the LLM case, the reward depends on the model's *own*
   sampled output. If you don't detach, gradients could flow back
   through the verifier — and the model would learn to game the
   reward function rather than improve its policy. Detach is a
   hard contract: **rewards are environment signals, not
   differentiable functions**.

3. "Why `.detach()` on `log_prob_old`?"
   → `logits_old` is the snapshot of the policy at sampling time.
   Even if it came from the same model, we treat it as a
   constant — gradients should only update the *current* policy
   parameters. In chapter 6's compute_grpo_loss they do one
   step per rollout, so `old == new` and detach happens
   implicitly. In chapter 7 / the full algorithm, this matters.

4. "Why `min(ratio * A, clipped * A)` and not just
   `clipped * A`?"
   → Asymmetry. When `A > 0` and ratio explodes upward, you
   want to clip to prevent huge upward steps. When `A < 0` and
   ratio collapses downward, you want to clip the *other* way.
   Taking the min gives you a pessimistic bound that prevents
   reward-hacking the surrogate in either direction. Walk through
   the four cases (`A` positive/negative × ratio above/below 1).

5. "What's the gradient of the loss when the clip is active?"
   → Zero. Hence the policy can't take a step from this sample
   until something else changes. That's the safety bound.

### Common pitfalls

1. **Forgetting `.detach()`** — code may still pass small tests
   but be subtly wrong in a real LLM training loop. Treat detach
   as a hard requirement.
2. **`torch.minimum` vs `torch.min`** — both work for elementwise
   min of two tensors. `min(tensor)` (one arg) reduces — not
   what you want.
3. **Forgetting the negative sign** — same as REINFORCE: this is
   a maximization objective; we negate to make it a loss.
4. **Computing `ratio = pi_new / pi_old`** instead of
   `exp(logp_new - logp_old)` — numerically unstable for tiny
   probabilities (which any LLM produces). Use the exp-of-diff
   form.

## On Completion

### Insight

The clipped surrogate is the entire reason PPO and GRPO work in
practice. Without it, policy gradient methods are notoriously
unstable: one bad batch and the policy collapses to a degenerate
distribution. The clip says "I trust my advantage estimate only
locally — within `[1-eps, 1+eps]` of the sampling distribution."
Eps is usually `0.2`.

`.detach()` is the part students get most wrong on first contact.
Internalize: **rewards and advantages are environment, not
parameters. Gradients flow only into the policy.**

### Bridge

The final kata, `grpo-bandit-training`, wires everything together:
the bandit (kata 1) as environment, a softmax policy, your group
advantage (kata 4), and this clipped loss into a real training
loop. You'll watch the policy concentrate on arm 2 in a few
hundred steps.
