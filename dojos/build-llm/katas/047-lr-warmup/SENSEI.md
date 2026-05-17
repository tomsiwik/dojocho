# SENSEI — lr-warmup

## Briefing

### Goal

Implement linear learning-rate warmup. For the first `warmup_steps` of
training, interpolate the learning rate linearly from `initial_lr` up to
`peak_lr`. After that, return `peak_lr`.

This is the first of three schedule katas. By the end of the trio you
will have the full warmup + cosine-decay schedule used in every modern
LLM pretraining loop.

### Tasks

1. Implement `linear_warmup(step, warmup_steps, initial_lr, peak_lr)`.
   - At `step == 0`, return `initial_lr`.
   - At `step == warmup_steps`, return `peak_lr`.
   - In between, linearly interpolate.
   - For `step > warmup_steps`, return `peak_lr` (clamped).

### Hints

- Linear interpolation: `initial_lr + (peak_lr - initial_lr) * (step / warmup_steps)`.
- Be careful with the boundary: at `step = warmup_steps`, the formula
  should give exactly `peak_lr`.
- A single `min(...)` (or `if`) handles the post-warmup clamp.

## Prerequisites

None for the math. Conceptually, knowing that AdamW maintains running
averages of gradient first and second moments helps explain *why*
warmup is necessary.

## References

- Raschka Appendix D, §D.1 (Learning rate warmup).
- The original "Attention Is All You Need" paper used a warmup schedule
  for the same reason — early Adam estimates are unreliable.

## Teaching Approach

Method: **Strong Socratic.** The arithmetic is trivial; the *reason*
is everything.

### Socratic prompts

- "AdamW maintains a running estimate of the gradient's first and
  second moments. What are those estimates at step 1, with one sample
  of data?"
- "If your second-moment estimate is wildly wrong on step 1, what does
  a full-size step do to your weights?"
- "Warmup gives the moment estimates time to stabilize. What's the
  minimum-viable warmup — one step? ten? Why?"
- After it works: "Why not just start with a tiny LR and never warm up?
  What does the peak buy you?"

### Common pitfalls

1. **Off-by-one at the boundary.** `step == warmup_steps` must yield
   exactly `peak_lr`. If you divide by `warmup_steps - 1` you'll be
   one step early; if you forget the clamp you'll keep climbing.
2. **Integer division.** `step / warmup_steps` in Python 3 is fine
   (true division), but if you typed `//` somewhere you'll get 0 for
   most of warmup. Print intermediate values if a test fails.
3. **Returning a tensor.** This is a pure function — return a Python
   `float`.

## On Completion

### Insight

You just wrote the first three lines of every LLM training loop ever
shipped. Warmup is not optional for transformers — without it, the
first few steps of Adam's adaptive learning rate are based on garbage
statistics, and one bad step can poison the entire run. The schedule
itself is trivial; understanding *why* it's necessary is the kata.

### Bridge

Next kata: `cosine-decay`. Warmup gets you up to `peak_lr` safely.
Now you need to come *down* gracefully — running at peak LR forever
will cause the loss to oscillate near the minimum without ever
settling. Cosine decay is the standard answer.
