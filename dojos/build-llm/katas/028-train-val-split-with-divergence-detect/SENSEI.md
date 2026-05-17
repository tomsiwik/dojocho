# SENSEI — train-val-split-with-divergence-detect

## Briefing

### Goal

Train on a tiny corpus long enough that you can **see** the model
overfit. Track train and val losses per epoch. Then write a tiny
detector that finds the epoch where val loss starts climbing — the
canonical "stop training" signal.

This is the single most important diagnostic in supervised ML. A model
that gets better on training data while getting worse on held-out data
is **memorizing, not learning**.

### Tasks

1. Implement `train_with_val(model, optimizer, train_loader, val_loader, num_epochs)`:
   - Per epoch: train one pass on `train_loader`, then evaluate on
     `val_loader` (with `model.eval()` and `torch.no_grad()`).
   - Return `(train_losses, val_losses)` — two `list[float]` of length
     `num_epochs`.

2. Implement `evaluate(model, dataloader)`:
   - Compute mean cross-entropy loss over `dataloader` without
     updating any weights.
   - Return a single `float`.

3. Implement `detect_overfit(train_losses, val_losses)`:
   - Return the epoch index (0-based) where val loss FIRST starts
     increasing (i.e., `val_losses[i] > val_losses[i-1]`) **and stays
     above** the minimum seen so far.
   - More precisely: return the **first epoch** `i >= 1` such that
     `val_losses[i] > min(val_losses[:i])`.
   - Return `-1` if val loss never increases (no overfit detected).

### Hints

- `model.eval()` + `with torch.no_grad():` for the val pass —
  otherwise you waste memory storing the graph.
- For `detect_overfit`: walk the list, track `running_min`, return
  the first index whose value strictly exceeds `running_min`.
- The test corpus is intentionally tiny (~12 tokens). Overfitting is
  guaranteed within ~20 epochs.

## Prerequisites

- Kata: training-loop.
- Kata: cross-entropy-from-logits.

## References

- Raschka chapter 5 §5.2 — discusses train/val split and shows the
  loss-curve plot that motivates early stopping.
- "Bias-variance tradeoff" — the theoretical framing of what you're
  seeing.

## Teaching Approach

**Demonstration + Socratic.** Run it. Look at the divergence. Then
diagnose.

### Socratic prompts

- After it passes, look at the printed losses: "Describe in ONE
  sentence what's happening between epoch 5 and epoch 15."
  (Train loss keeps dropping; val loss bottoms out then climbs. The
  model is memorizing the train set.)
- "List 3-5 things you could do to fix this. Don't justify, just
  list." (More data, regularization (dropout, weight decay), smaller
  model, early stopping, data augmentation, learning-rate decay.)
- "Now pick ONE and explain why it's the right first thing to try
  here." (For a tiny corpus: more data is impossible — that's the
  whole point. Early stopping is free. Dropout is one line. Smaller
  model means re-architecting. Pick early stopping or dropout.)
- "Your `detect_overfit` returns the first epoch where val loss
  exceeds its running minimum. Why not 'first epoch where val loss
  > previous epoch'? Trace through `[3.0, 2.0, 2.1, 1.9, 2.5]`."
  (Naive 'val[i] > val[i-1]' fires at epoch 2 (2.1 > 2.0), then val
  goes BACK DOWN to 1.9 — so epoch 2 wasn't actually overfit. The
  running-min version correctly identifies epoch 4 as the real
  divergence.)

### Common pitfalls

1. **No `.eval()` on val** — dropout stays active and val loss looks
   noisier than it should.
2. **No `torch.no_grad()` on val** — works, but you waste memory
   storing the backward graph for a forward pass you don't need to
   differentiate.
3. **Overfit detector fires on noise** — naive 'val[i] > val[i-1]'
   triggers on the first up-tick, even if val keeps going down after.
   Use running-min.
4. **Reusing the train loop's loss accumulation** — your training
   loop probably returns a per-epoch mean. For eval, you also want
   the per-epoch mean over the val set. Same code path.

## On Completion

### Insight

The graph you just produced — train loss going down, val loss
U-shaped — is the **single most-printed plot in ML**. The point where
val loss starts climbing is your *natural* stopping signal.

Modern training uses three flavors of this:
1. **Early stopping** — stop when val hasn't improved in N epochs.
2. **Best-checkpoint selection** — keep the weights with minimum val
   loss, throw away the rest.
3. **Cross-validation** — split many ways, average the detected
   stopping epoch.

You'll see all three when you read real training code.

### Bridge

Next: **decoding-strategies**. Until now you've only used `argmax` to
pick the next token — and you saw in earlier katas that argmax
produces degenerate, repetitive text. Time to meet temperature, top-k,
and top-p (nucleus sampling) — the three knobs every LLM API gives you.
