# SENSEI — adaptive-kl-coefficient

## Briefing

### Goal

Implement Schulman's adaptive KL coefficient controller from the PPO
paper. Instead of picking a fixed `beta` for your KL-penalized GRPO
loss, you watch the observed KL each step and adjust `beta` to keep
the actual divergence near a target you specify.

### Tasks

1. Implement `update_beta(beta, kl, target_kl, lr=0.5) -> float`:
   - If `kl > 2 * target_kl`: `beta *= (1 + lr)` (KL too high → tighten).
   - If `kl < 0.5 * target_kl`: `beta /= (1 + lr)` (KL too low → loosen).
   - Otherwise: return `beta` unchanged (we're in the deadband).
   - Return a plain `float`, always strictly positive.

### Hints

- This is literally three branches and a multiply/divide. Don't
  overthink it.
- The (1 + lr) form is Schulman's choice; it means a single step is
  always a multiplicative move of at most (1 + lr).
- Make sure division uses `/`, not `//`. `beta` is a float, not an int.

## Prerequisites

- `kl-divergence-categorical` (you know what `kl` means).
- `kl-penalized-grpo` (you know where `beta` plugs in).

## References

- Schulman et al., PPO paper §4 — https://arxiv.org/abs/1707.06347.
  Equations 7 and 8 are exactly this controller.
- Raschka build-reasoning chapter 7 §7.5 — discusses fixed-beta
  failure modes that motivate this controller.

## Teaching Approach

**Code-reading + Socratic.** The implementation is trivial; the
interesting work is understanding why this controller exists.

### Socratic prompts

- "Why adapt at all? Why not pick a fixed `beta` and move on?"
  (Different prompts, different stages of training, and different
  models all want different `beta`. The KL signal varies by orders of
  magnitude over a run; a single `beta` is wrong almost everywhere.)
- "What does `target_kl` encode? In what units?"
  (Roughly: how far per update step are you willing to let the policy
  move? In nats. Typical PPO target: 0.01-0.1.)
- "Why the asymmetric thresholds — 2× and 0.5×? Why not 1.1× and
  0.9× to be more responsive?"
  (Avoids oscillation. The deadband absorbs noise in the KL estimate;
  small thresholds would chatter `beta` up and down forever.)
- "What's the failure mode if `lr` is too large?"
  (Beta overshoots, KL overshoots in the opposite direction, you get
  a bang-bang controller and KL oscillates instead of settling.)
- "Could `beta` go to zero or infinity? What protects against each?"
  (Zero: only when KL is persistently tiny — at which point you
  *want* `beta` small. The `(1 + lr)` factor never makes it exactly
  zero. Infinity: only when KL persistently explodes, in which case
  you have a bigger problem than `beta`.)
- After it passes: "How is this different from gradient descent on
  `beta`? When would you prefer one over the other?" (This is a
  rule-based controller; GD on `beta` would need a meta-objective.
  Schulman's is cheaper and surprisingly robust.)

### Common pitfalls

1. **Asymmetric multiplier mistake.** `beta *= (1 - lr)` for the
   "too low" branch is wrong — it can drive `beta` negative if
   `lr >= 1`. Use `beta /= (1 + lr)` (or equivalently `*= 1/(1+lr)`).
2. **Wrong direction.** `kl > 2*target` means we're drifting too
   much → need *more* penalty → `beta` goes UP. Flipping this turns
   the controller into a runaway destabilizer.
3. **Forgot the deadband.** Always-update controllers chatter.
4. **Returned a tensor.** `beta` is a hyperparameter, not a learnable
   parameter. Plain Python float.

## On Completion

### Insight

You implemented Schulman's adaptive KL controller — a four-line
function that quietly does more for training stability than most of
the algorithmic tweaks you'll read about. The pattern (target a
constraint via a control loop on a hyperparameter) shows up
everywhere: learning rate warmup, gradient clipping thresholds,
entropy bonuses, even dropout schedules.

### Bridge

Next kata: **reward-hacking-detector** — even with KL regularization,
the model can learn to game the reward function. You'll write a
diagnostic that detects the canonical signature of reward hacking
from training logs alone.
