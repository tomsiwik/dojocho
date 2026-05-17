# SENSEI — cross-entropy-from-logits

## Briefing

### Goal

Implement cross-entropy loss by hand — from raw logits and integer
targets — and verify your implementation against `F.cross_entropy`.

This is the loss every LLM is trained with. Until you can derive it
from `log_softmax + gather`, it's a black box.

### Tasks

1. Implement `cross_entropy_from_logits(logits, targets)`:
   - `logits` has shape `(N, V)` — raw scores over a vocabulary.
   - `targets` has shape `(N,)` — integer class IDs in `[0, V)`.
   - Return a scalar tensor: the **mean** negative log-probability of
     the target class.
   - Use `F.log_softmax` + `gather` (or fancy indexing). Do **not** use
     `F.cross_entropy`, `F.nll_loss`, or `F.softmax + log`.

2. Implement `cross_entropy_3d(logits, targets)` for LLM-shaped tensors:
   - `logits` has shape `(B, T, V)`.
   - `targets` has shape `(B, T)`.
   - Flatten to `(B*T, V)` / `(B*T,)`, then delegate to part 1.

### Hints

- `F.log_softmax(logits, dim=-1)` gives `log p` in one numerically
  stable call. Computing `log(softmax(x))` directly will overflow.
- `log_probs.gather(dim=-1, index=targets.unsqueeze(-1)).squeeze(-1)`
  picks out the log-prob of the correct class for each row.
- The loss is `-mean(log_p_correct)`.
- For 3D: `logits.view(-1, V)` and `targets.view(-1)`.

## Prerequisites

- Kata 004 (you've seen `(input, target)` pairs — those targets ARE
  the integer class IDs here).
- Comfort with `torch.Tensor.shape` and basic indexing.

## References

- Raschka chapter 5 §5.1.2 — "Calculating the text generation loss".
  Walks the 6 steps that `F.cross_entropy` collapses into one call.
- PyTorch docs: `torch.nn.functional.log_softmax`,
  `torch.Tensor.gather`, `torch.nn.functional.cross_entropy`.

## Teaching Approach

**Strong Socratic.** This is a *why* kata as much as a *what*.

### Socratic prompts

- "Why cross-entropy and not MSE? If the model outputs probability
  0.01 for the correct token vs 0.001, MSE says 'about the same
  error'. What does CE say?"
- "Why `log_softmax` instead of `log(softmax(x))`? Try `x = torch.tensor([1000., 1001.])`
  and compare. What does numerical stability mean in one sentence?"
- "Walk through the 6 steps from Raschka §5.1.2: softmax → pick
  target probs → log → mean → negate. Which step does `log_softmax`
  fuse? Which does `gather` do? Which does `.mean()` do?"
- "Your loss returns a scalar. What shape would `F.cross_entropy(..., reduction='none')`
  return? When would you want that?" (Answer: per-token loss for
  masking padded positions — you'll need this for instruction tuning.)
- After it passes: "If targets contained `-100`, what would
  `F.cross_entropy` do? What does YOUR implementation do?" (CE
  ignores -100 by default; yours doesn't — and that's fine here.)

### Common pitfalls

1. **Off-axis softmax** — `F.log_softmax(logits, dim=0)` normalizes
   the wrong dimension. The vocabulary axis is `-1`.
2. **Sum vs mean** — `F.cross_entropy` defaults to `reduction='mean'`.
   If your test diff is exactly `1/N` off, you summed instead.
3. **`gather` shape mismatch** — `gather` needs `index` to have the
   same number of dims as the source. `targets.unsqueeze(-1)` then
   `.squeeze(-1)` after.
4. **Calling `F.softmax` then `.log()`** — works, but blows up for
   large logits. The fix is `log_softmax`, which subtracts the max
   internally.

## On Completion

### Insight

You just wrote the loss function for every modern LLM — GPT, Llama,
Claude, all of them — in three lines. The interesting part is the
*shape* of the gradient: `softmax(logits) - one_hot(target)`. When
the model is confident and correct, that's near-zero. When it's
confidently wrong, it's huge. That asymmetry — small gradient when
right, large when wrong — is what makes CE work as a learning signal.

### Bridge

Next kata: **perplexity** — the natural way to *report* this loss to
humans. `perplexity = exp(cross_entropy)`, and it has a beautiful
interpretation: "the model is as confused as if it had to pick
uniformly among this many tokens."
