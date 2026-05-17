# SENSEI — cosine-decay

## Briefing

### Goal

Implement half-cosine learning-rate decay. Starting at `peak_lr`,
smoothly decay to `min_lr` over `total_steps` steps following the
shape of the first half of a cosine wave.

### Tasks

1. Implement `cosine_decay(step, total_steps, peak_lr, min_lr)`.
   - At `step == 0`: return `peak_lr`.
   - At `step == total_steps`: return `min_lr`.
   - At `step == total_steps / 2`: return the midpoint of the
     half-cosine, which is `(peak_lr + min_lr) / 2`.
   - For `step > total_steps`: clamp to `min_lr`.

### Hints

- The closed form is
  `min_lr + (peak_lr - min_lr) * 0.5 * (1 + cos(pi * progress))`
  where `progress = step / total_steps`.
- `cos(0) = 1` (start), `cos(pi) = -1` (end), `cos(pi/2) = 0` (mid) —
  walk through each to convince yourself the boundaries are right.
- `math.cos` and `math.pi`.

## Prerequisites

- `lr-warmup` (boundary thinking, returning a Python `float`).

## References

- Raschka Appendix D, §D.2 (Cosine decay).
- Loshchilov & Hutter, "SGDR: Stochastic Gradient Descent with Warm
  Restarts" — introduced the cosine schedule.

## Teaching Approach

Method: **Socratic + numerical experiment.** The closed form is one
line, but feeling *why* cosine beats linear or exponential is the
lesson.

### Numerical experiment (do before coding)

Compute the learning rate at the midpoint of training with
`peak_lr=1e-3`, `min_lr=1e-5` under three schedules:

- Linear:      `peak - (peak - min) * progress`
- Exponential: `peak * (min / peak) ** progress`
- Cosine:      `min + (peak - min) * 0.5 * (1 + cos(pi * progress))`

At `progress = 0.5`:
- Linear      → 5.05e-4
- Exponential → ~1e-4   (drops very fast)
- Cosine      → 5.05e-4 (same as linear, but...)

Now compute at `progress = 0.1` and `progress = 0.9`. Notice cosine
stays *near peak* for longer at the start, then drops *faster* at the
end. That asymmetry is the whole point.

### Socratic prompts

- "Where do you want to spend the most training time — near peak LR
  or near min LR? Why?"
- "What does the loss surface look like near a minimum? Big steps or
  small steps?"
- "Cosine spends roughly the first 25% near peak and the last 25%
  near min. Why is that the right shape?"

### Common pitfalls

1. **`progress > 1` produces NaN-adjacent values.** `cos(pi * 1.5)` is
   defined but the formula will overshoot below `min_lr`. Clamp `step`
   (or `progress`) before the cosine.
2. **`peak_lr` vs `min_lr` order swapped.** The formula
   `min + (peak - min) * (1 + cos)/2` gives `peak` at step 0 and `min`
   at step `total_steps`. Confirm with the boundary tests.
3. **Returning a tensor.** Pure float in, pure float out.

## On Completion

### Insight

Cosine decay is the *de facto* schedule for LLM pretraining.
GPT-3, LLaMA, Chinchilla, all use it. The reason: it spends most of
its time near both extremes and transitions smoothly through the
middle. Near peak you make rapid progress; near min you fine-tune
without overshooting; the smooth transition prevents the optimizer
from being shocked by sudden LR changes.

### Bridge

Next kata: `warmup-then-cosine`. You now have both halves of the
schedule — linear warmup up to peak, then cosine decay down to min.
Combining them is fiddly bookkeeping (off-by-one risk on the
boundary), so the next kata is a Parsons-style puzzle to isolate the
piecewise logic.
