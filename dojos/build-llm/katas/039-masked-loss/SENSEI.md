# SENSEI — Masked Loss

## Briefing

### Goal

Implement masked cross-entropy: a loss that only contributes from
positions where `mask == 1`. Then prove your implementation matches
PyTorch's standard trick — `F.cross_entropy(..., ignore_index=-100)`
applied to targets whose masked positions are replaced with `-100`.

Two formulations, same number. Knowing both is the difference between
reading Raschka's code and reading production fine-tuning code.

### Tasks

1. Implement `masked_ce(logits, targets, mask) -> torch.Tensor`:
   - `logits`: shape `(B, T, V)` — batched logits over vocabulary.
   - `targets`: shape `(B, T)` of `torch.long`.
   - `mask`: shape `(B, T)` of 0/1 (any dtype, treat as boolean).
   - Return: scalar tensor. The mean cross-entropy across **only**
     positions where `mask == 1`. If no position is masked-in, return
     `torch.tensor(0.0)` (do NOT divide by zero).

2. Implement `targets_with_ignore(targets, mask, ignore_index=-100) -> torch.Tensor`:
   - Returns a copy of `targets` where `mask == 0` positions are
     replaced with `ignore_index`. This is the helper used by the
     equivalence test.

### Hints

- `F.cross_entropy` wants `(N, V)` and `(N,)`, not `(B, T, V)` /
  `(B, T)`. Reshape with `.view(-1, V)` and `.view(-1)`.
- For your masked version: compute per-position loss with
  `F.cross_entropy(..., reduction='none')`, then average over
  positions where mask is 1.
- The equivalence with `ignore_index=-100` works because PyTorch's
  cross_entropy with `ignore_index` averages *only over non-ignored
  positions*. That matches your masked mean.

## Prerequisites

- Kata `instruction-dataset` — you have a mask to plug in.
- Comfortable with `torch.nn.functional.cross_entropy` and its
  `reduction` / `ignore_index` parameters.

## References

- Raschka chapter 7 §7.3 — the `-100` ignore-index discussion
  (figure 7.11, the example with `loss_1`, `loss_2`, `loss_3`).
- PyTorch docs:
  https://pytorch.org/docs/stable/generated/torch.nn.functional.cross_entropy.html

## Teaching Approach

**Method:** Worked example + Socratic on what to mask.

### Worked example

Replicate the Raschka demo in your head:

```
logits = [[-1.0, 1.0], [-0.5, 1.5], [-0.5, 1.5]]
targets = [0, 1, 1]              # full loss
targets = [0, 1, -100]           # third position ignored
# Both give the same number as the 2-element case.
```

Your `masked_ce` with `mask = [1, 1, 0]` should give the same number.

### Socratic prompts

- "What's the difference between `mask.sum() == 0 → return 0.0` and
  `mask.sum() == 0 → raise`? In a training loop, which would you
  rather have for an unlucky batch?" (Answer: the zero — don't crash
  on a degenerate batch; just skip the update.)
- "You can mask **padding** tokens (universal), **prompt** tokens
  (debated; Raschka §7.3 cites Shi et al. 2024 saying don't),
  or **neither**. What does each teach the model? What doesn't it
  teach?" (Answer: padding-only teaches both prompt and response →
  some overfitting on instructions; prompt+padding teaches only
  responses → more generalization; no masking → model also learns to
  generate prompts, which can be confusing.)
- "Why does PyTorch pick `-100` as the sentinel and not, say, `-1`?"
  (Answer: `-1` is a valid index in PyTorch tensor semantics; `-100`
  is well outside any reasonable vocabulary size, so it can't
  accidentally match.)

### Common pitfalls

1. **Reshape mismatch** — `logits.view(-1, V)` flattens B and T;
   `targets.view(-1)` must do the same. The mask must too, before
   you index.
2. **Dividing by `mask.numel()` instead of `mask.sum()`** — that's
   "average over all positions" not "average over response positions"
   — different number, different gradient.
3. **`mask.float()` vs `mask.bool()`** — `F.cross_entropy(..., reduction='none')`
   gives per-position losses; multiplying by `mask.float()` zeros out
   masked-out positions, then `(loss * mask).sum() / mask.sum()` is
   the correct mean. Don't `loss[mask.bool()].mean()` — works but
   makes the equivalence harder to see.
4. **Using mean reduction with ignore_index** — yes, that gives the
   same result. Don't be surprised when your two formulations agree.

## On Completion

### Insight

You've just shown that two very different-looking pieces of code
compute the same number:

- "Average per-position loss, but only over positions where mask=1."
- "Replace masked-out positions with -100 in targets, then use
  cross-entropy with ignore_index=-100."

Raschka picks the second because it composes cleanly with the
stock `train_model_simple` from chapter 5 — *no* loss function
changes are needed when moving from pretraining to instruction
tuning. Production libraries (HuggingFace, TRL) pick the first
because it's easier to extend (per-sample loss weights, RLHF reward
shaping, etc.).

### Bridge

The next kata (`instruction-train-step`) wires this together:
dataset → model → masked loss → backprop. You'll do one optimizer
step on a tiny synthetic dataset and verify the loss drops.

When you do, ask yourself: how is this different from the pretraining
loop in kata 030-ish? **It isn't.** The only thing that changed is
the dataset (instruction-formatted, with a mask) and (optionally)
the loss reduction. That's the whole secret of instruction fine-tuning.
