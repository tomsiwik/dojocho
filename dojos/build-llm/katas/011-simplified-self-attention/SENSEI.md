# SENSEI — Simplified Self-Attention

## Briefing

### Goal

Strip attention down to its skeleton: **no trainable weights, no Q/K/V,
no scaling, no mask**. Just three lines. Make the core mechanic — *each
token is a weighted average of all tokens, weighted by similarity* —
something you have already typed before any of the named complications
land on top of it.

### Tasks

1. Implement `attention_scores(x)` — for an input tensor of shape
   `(T, d)`, return the raw dot-product score matrix of shape `(T, T)`.
   Element `[i, j]` is `x[i] · x[j]`.
2. Implement `attention_weights(scores)` — apply `softmax` row-wise so
   each row sums to 1.
3. Implement `simplified_self_attention(x)` — compose the two steps and
   return the context tensor `(T, d)` where each row is a weighted
   average of `x`'s rows.

### Hints

- `x @ x.T` is one matmul. That is the score matrix.
- `torch.softmax(..., dim=-1)` normalizes the last axis (one row at
  a time).
- The context tensor is `weights @ x`. Shapes:
  `(T, T) @ (T, d) = (T, d)`.
- Total: about three lines of real code.

## Prerequisites

- Kata 004 (training-pairs-from-text) — you've held a `(T, d)` token
  tensor in your head before.
- A passing familiarity with `torch.tensor` and matmul. If you've never
  multiplied tensors, read Raschka appendix A §A.4 first.

## References

- Raschka chapter 3 §3.3 — "Attending to different parts of the input
  with self-attention" (figures 3.7–3.12).
- `torch.softmax` — https://pytorch.org/docs/stable/generated/torch.nn.functional.softmax.html

## Teaching Approach

This is the *worked example* of the chapter. Run it on a 4-token, 3-dim
toy input and stare at the matrix. Then Socratic.

### Socratic prompts

- "The output is a weighted average of value vectors. Average of WHAT?
  Weighted by WHAT? (No Q/K/V here — the 'value' is just `x` itself.)"
- "Why is dot product the right notion of 'similarity'? What does a
  large dot product mean for two unit-norm vectors? A negative one?"
- "Print one row of `attention_weights`. What do the numbers sum to?
  What does that guarantee about the magnitude of the context vector
  relative to the input vectors?"
- "Take an input where row 0 and row 3 are identical. What do you
  expect `attention_weights[0]` to look like? Run it. Were you right?"

### Common pitfalls

1. **Softmax along the wrong axis** — `dim=0` normalizes columns; you
   want `dim=-1` (rows). Check that every row sums to 1, not every
   column.
2. **Forgetting transpose** — `x @ x` is shape `(T, d) @ (T, d)` which
   doesn't compose. You need `x @ x.T`.
3. **Treating scores as weights** — raw dot products can be negative
   and don't sum to anything in particular. They are *not* a probability
   distribution until you softmax them.

## On Completion

### Insight

You wrote self-attention in three lines. Strip out every named concept
(query, key, value, scale, mask, head) and you are left with: *each
token's output is a similarity-weighted average of all tokens*. That is
the entire idea. The next six katas are bolted-on machinery — trainable
projections so the network chooses what "similarity" means, a scale
factor that fixes softmax saturation, a mask that hides the future, and
parallel heads that let the network learn several notions of similarity
at once.

### Bridge

Kata `qkv-projections` introduces the Q/K/V split. The question it
forces: *is "what this token is looking for" the same vector as "what
this token has to offer"?* You'll discover why three projections beat
one.
