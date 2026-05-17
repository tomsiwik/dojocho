# SENSEI — warmup-then-cosine

## Briefing

### Goal

Combine the two previous schedules into the canonical LLM training
schedule: linear warmup from `initial_lr` to `peak_lr` for the first
`warmup_steps`, then half-cosine decay from `peak_lr` down to `min_lr`
over the remaining `total_steps - warmup_steps` steps.

### Tasks

1. Implement `warmup_then_cosine(step, total_steps, warmup_steps,
   initial_lr, peak_lr, min_lr) -> float`.
   - `step < warmup_steps`  → linear warmup
   - `step == warmup_steps` → exactly `peak_lr` (the boundary!)
   - `warmup_steps < step <= total_steps` → cosine decay over the
     *remaining* horizon (i.e. progress is measured relative to
     `total_steps - warmup_steps`, not `total_steps`)
   - `step > total_steps`   → clamp to `min_lr`

### Hints

- This is a piecewise function. One `if` is enough.
- The cosine phase progress is
  `progress = (step - warmup_steps) / (total_steps - warmup_steps)`.
  At `step = warmup_steps`, progress is 0 (so you get `peak_lr`).
  At `step = total_steps`, progress is 1 (so you get `min_lr`).
- You can call your previous `linear_warmup` and `cosine_decay` if
  you copy them in — but the cleaner solution inlines both.

## Prerequisites

- `lr-warmup`
- `cosine-decay`

## References

- Raschka Appendix D, §D.2 (the combined loop is shown in §D.4).
- Almost every modern LLM training script: this is the schedule.

## Teaching Approach

Method: **Parsons-style + Socratic.** The math is just the previous
two katas glued together, but the boundary bookkeeping bites.

### Parsons puzzle (the boundary)

Three candidate `progress` expressions for the cosine phase:

```
A.  progress = step / total_steps
B.  progress = (step - warmup_steps) / total_steps
C.  progress = (step - warmup_steps) / (total_steps - warmup_steps)
```

Question: which one yields `peak_lr` at `step == warmup_steps` AND
`min_lr` at `step == total_steps`?

Try each on paper before coding. Only one survives both boundaries.

### Socratic prompts

- "At `step == warmup_steps`, which branch fires — warmup or cosine?
  Both should give the same answer. Why?"
- "If `warmup_steps == 0`, your function should degrade to pure
  cosine decay. Does it? Walk through `step == 0`."
- "If `warmup_steps == total_steps`, you have no cosine phase. What
  should happen at `step == total_steps`?"

### Common pitfalls

1. **Wrong progress denominator** (option A or B above). Spot it by
   plugging in `step = warmup_steps + 1` and checking the LR is just
   below `peak_lr` — not jumping somewhere arbitrary.
2. **Double-counting the boundary.** If both branches give `peak_lr`
   at `step == warmup_steps`, fine. If they disagree, you have a
   discontinuity — that's a bug.
3. **Forgetting to clamp past `total_steps`.** Cosine progress > 1
   silently produces values below `min_lr` (then climbs again as the
   cosine oscillates).

## On Completion

### Insight

Read Raschka §D.4: the schedule you just wrote is exactly the
`if global_step < warmup_steps: ... else: ...` block from his
`train_model` function. Combined with AdamW and gradient clipping,
this is the entire learning-rate machinery for modern LLM
pretraining. The training loops you'll write going forward will all
have these three lines in some form.

### Bridge

Next kata: `gradient-clip-global-norm`. The LR schedule controls
*step size*; gradient clipping controls *step direction safety*. A
single bad batch can produce a gradient 100x larger than typical;
without clipping, that one step can undo hours of training. You'll
implement global-norm clipping the way PyTorch does it, and prove
that it preserves gradient direction (unlike per-tensor clipping).
