# SENSEI — Scaled Dot-Product Attention

## Briefing

### Goal

Compose the Q/K/V projections from the previous kata with the **scaled
dot-product attention** formula:

```
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
```

The `1 / sqrt(d_k)` factor is the most-asked-about constant in the
transformer literature. You will *discover* it by running an
experiment in which softmax saturates without it.

### Tasks

1. (Investigation, no code submitted.) Read the **Numerical experiment**
   section below and run it. You must be able to explain why
   `sqrt(d_k)` lives in the formula before you proceed.
2. Implement `scaled_dot_product_attention(Q, K, V)` — a pure function
   on three tensors of shape `(B, T, d_k)`. Return the context tensor
   of shape `(B, T, d_v)` (here `d_v == d_k`).
3. Implement `SelfAttention(d_in, d_out)` — an `nn.Module` that wraps a
   `QKVProjection`-like trio and calls the pure function in `forward`.
   Name the three linear layers `W_q`, `W_k`, `W_v` (no bias).

### Hints

- `K.transpose(-2, -1)` swaps the last two dims; works for batched and
  unbatched alike.
- `d_k = K.shape[-1]`. Don't hardcode.
- `torch.softmax(..., dim=-1)`.
- For `SelfAttention.forward`, compute `Q, K, V` via the three linear
  layers, then delegate to your pure function.

### Numerical experiment

Before you implement, run this (in a scratch file or the REPL):

```python
import torch
for d in (4, 64, 512):
    torch.manual_seed(0)
    q = torch.randn(d)
    k = torch.randn(8, d)
    scores = k @ q            # 8 scores
    print(f"d={d:>3} | max={scores.max():.2f}  min={scores.min():.2f}")
    print("  softmax:", torch.softmax(scores, dim=-1).tolist())
    print("  softmax(scaled):", torch.softmax(scores / d**0.5, dim=-1).tolist())
```

At `d=4`, the softmax is gentle. At `d=512`, one entry is near 1.0 and
the rest are near 0. Now compare against the scaled version. The
scaled version stays well-distributed across all `d`.

## Prerequisites

- `simplified-self-attention`
- `qkv-projections`

## References

- Raschka chapter 3 §3.4.1, sidebar **"The rationale behind
  scaled-dot product attention"** — the variance argument in one
  paragraph.
- "Attention is All You Need," Vaswani et al. 2017, eq. (1).
- `torch.softmax` — https://pytorch.org/docs/stable/generated/torch.nn.functional.softmax.html

## Teaching Approach

**Socratic, driven by the numerical experiment above.** Don't argue the
math first; let the student feel softmax saturation, *then* derive the
fix.

### Socratic prompts

- "You ran the experiment. What happened to the dot products as `d`
  grew? What happens to their variance if each component of `q` and
  `k` is unit-variance?" (Answer: variance of dot product scales like
  `d`, so std scales like `sqrt(d)`.)
- "Softmax on a vector with one large entry and many small ones. What
  does it return? What does that do to the gradient — `softmax * (1 -
  softmax)` at saturation?" (Answer: vanishing gradient.)
- "We need to *cancel* the `sqrt(d)` growth. Divide the scores by what?"
- "Why divide *before* softmax and not after? What does dividing after
  softmax do?" (After softmax, all rows sum to 1; dividing breaks that
  and shifts gradients differently. The whole point is to keep the
  pre-softmax logits in a sane range.)
- "Why `sqrt(d_k)` and not `sqrt(d_v)`?" (The dot product is in the
  `d_k` space — that's the dimension being summed over.)

### Common pitfalls

1. **Scaling by `d_k` instead of `sqrt(d_k)`** — too aggressive,
   under-distributes.
2. **Scaling after softmax** — kills the row-sum-to-1 invariant and
   doesn't fix the saturation problem.
3. **Using `K.T` for batched tensors** — `K.T` on a 3-D tensor permutes
   *all* dims, not just the last two. Use `K.transpose(-2, -1)`.
4. **Mixing up `dim=0` and `dim=-1` in softmax** — `dim=-1` so each
   query (row of the attention matrix) has its weights normalized
   across all keys.

## On Completion

### Insight

You wrote *the* attention formula — the one in the title of "Attention
is All You Need," the one inside every GPT, BERT, and Llama. Three
trainable matrices, one matmul, one scale, one softmax, one more
matmul. The scale exists for one reason: keeping softmax in its
non-saturated regime as `d_k` grows. Without it, dot-product attention
would have died on the vine because deeper models would have stopped
training.

### Bridge

Kata `causal-attention-mask` adds the upper-triangular `-inf` mask that
makes attention *causal* — forbidding each token from peeking at the
future. You'll see why "just slice off future tokens" doesn't work in
batched training.
