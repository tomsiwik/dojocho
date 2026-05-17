# SENSEI — kl-penalized-grpo

## Briefing

### Goal

Extend the plain GRPO policy-gradient loss with a KL penalty term that
keeps the current policy near a frozen reference. This is the
"complete" GRPO loss from Raschka build-reasoning §7.5:

    loss = grpo_loss + beta * kl(new, ref)

With `beta=0` you recover the REINFORCE-style GRPO loss you wrote in
chapter 6. With large `beta` the policy is pinned to the reference and
learning stalls (but the model also doesn't go off the rails).

### Tasks

1. Implement `grpo_loss(new_logps, rewards) -> torch.Tensor`:
   - Compute group-normalized advantages:
     `advantages = (rewards - rewards.mean()) / (rewards.std() + 1e-4)`.
   - Return `-(advantages.detach() * new_logps).mean()`.
2. Implement `kl_penalty(new_logps, ref_logps) -> torch.Tensor`:
   - Return `mean(new_logps - ref_logps)`. (Cheap MC estimate of
     KL(new || ref) — Raschka §7.5 listing 7.9.)
3. Implement `kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta)`:
   - Return `grpo_loss(...) + beta * kl_penalty(...)`.

### Hints

- `advantages` must be `.detach()`'d before multiplying with logps:
  rewards are a fixed learning signal, not a thing you backprop
  through.
- `ref_logps` should be detached too (it comes from a frozen ref
  model) — the test passes it already detached.
- The `+ 1e-4` in the advantage denominator avoids division by zero
  when all rewards are identical.

## Prerequisites

- `kl-divergence-categorical` (you understand which direction of KL
  this is approximating).
- A working mental model of GRPO from chapter 6 (group-normalized
  advantages, REINFORCE-style update).

## References

- Raschka build-reasoning chapter 7 §7.5 — "Controlling how much the
  model changes with a KL term", listing 7.9.
- PPO paper — https://arxiv.org/abs/1707.06347 (the KL term in
  PPO/GRPO descends from here).

## Teaching Approach

**Strong Socratic.** This kata is mostly about *why* the KL term
exists, not the three-line implementation.

### Socratic prompts

- "Without a KL term, GRPO can make the model arbitrarily different
  from the base. Why is that bad? Give me two distinct reasons."
  (1. Catastrophic forgetting — the base model knows English; the
  reward model only knows about reasoning correctness, so unconstrained
  RL deletes capabilities the reward doesn't measure.
  2. Reward hacking — the reward model is wrong off-distribution. Any
  policy that drifts far from base lands in regions where the reward
  model gives confidently wrong answers.)
- "Why use a *frozen* reference model and not the model from the
  previous step? What does each choice control?" (Frozen ref → long-
  term drift control. Prev step → per-step move size, which is what
  clipped policy ratios do. They're complementary.)
- "Look at `kl_penalty = mean(new_logps - ref_logps)`. That's not the
  full KL formula. Why is the simplification valid? What assumption
  does it make?" (It's a Monte Carlo estimate: we evaluate `log(p/q)`
  on samples *from p* — which is exactly what the rollouts are. The
  expected value of `log p - log q` under `p` is `KL(p || q)`.)
- "Sebastian's chapter shows training *collapsing* when the KL term
  dominates — `loss = β * mean(new_logps - ref_logps)` keeps rising
  forever if new_logps drift up. What feedback loop produced that?
  (Long responses → larger absolute logprob sums → bigger KL → more
  pressure to increase logprobs to lower the penalty → longer
  responses... the KL formulation is *not* length-normalized.)
- After it passes: "Several papers (Dr. GRPO, Olmo 3, DeepSeek-V3.2)
  now report better results *without* the KL term for math. What does
  that imply about when the KL is helping vs hurting?"

### Common pitfalls

1. **Forgot `.detach()` on advantages.** You'd backprop through the
   reward computation. Loss still trains, but the gradients are
   wrong; tests with explicit gradient checks would catch it.
2. **Swapped `new_logps - ref_logps`.** The penalty needs the
   *current* policy minus reference. Reversed sign → loss minimization
   pushes the policy *away* from the reference.
3. **Used `.std()` without `+ 1e-4`.** All-equal rewards make `.std()`
   zero. Add the epsilon.
4. **Wrote the full categorical KL.** That works for per-token KL
   (good!) but the test expects the per-sequence MC estimate from
   listing 7.9.

## On Completion

### Insight

You wrote the complete GRPO loss — REINFORCE + group-normalized
advantages + KL regularizer. That's the loss DeepSeek-R1 trains
with, modulo clipped policy ratios. Worth pausing on: the KL term
is the *only* thing keeping the model from speaking gibberish if
the reward model is even slightly misspecified. It's a small
addition that does a huge amount of safety work.

### Bridge

Next kata: **adaptive-kl-coefficient** — you'll discover that
picking a fixed `beta` is a pain (too high stalls learning, too low
lets the policy drift), and Schulman's PPO paper has an elegant
controller that adjusts `beta` automatically based on observed KL.
