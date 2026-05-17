# SENSEI — rms-norm

## Briefing

### Goal

Implement `RMSNorm` from scratch and verify it matches
`torch.nn.functional.rms_norm` numerically. RMSNorm is the normalization
layer of choice in modern LLMs (Llama, Qwen3, Mistral) — it replaces
LayerNorm by dropping the mean-subtraction step.

### Tasks

1. Implement `RMSNorm(d_model, eps=1e-6)` as an `nn.Module`:
   - `weight` parameter: `torch.ones(d_model)`, trainable.
   - Store `eps`.
2. In `forward(x)`:
   - Compute `mean(x**2)` over the **last** dim, `keepdim=True`.
   - Multiply `x` by `rsqrt(mean_sq + eps)`.
   - Scale by `weight` (broadcast over leading dims).
   - Return the result. **No bias term, no mean subtraction.**

### Hints

- `x.pow(2).mean(dim=-1, keepdim=True)` for the mean-square.
- `torch.rsqrt(...)` is `1 / sqrt(...)` in one fused op.
- Register `weight` via `nn.Parameter(...)` — otherwise it won't train.
- `eps` goes *inside* the rsqrt: `rsqrt(mean_sq + eps)`.

## Prerequisites

- `layer-norm` kata (you've already done classical LayerNorm).
- Comfortable with `nn.Module`, `nn.Parameter`, broadcasting.

## References

- Raschka *Build a Reasoning Model from Scratch*, Appendix C §C.1, Listing C.1.
- Zhang & Sennrich (2019), "Root Mean Square Layer Normalization" — https://arxiv.org/abs/1910.07467
- `torch.nn.functional.rms_norm` (PyTorch ≥ 2.4) — https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.rms_norm.html

## Teaching Approach

Code-reading + Socratic. The math is one line; the *why* is the lesson.

### Socratic prompts

- "LayerNorm subtracts the mean. RMSNorm doesn't. What does the mean
  subtraction buy you that RMSNorm gives up?" (Answer: zero-centering
  of activations. Empirically, the *scaling* is what matters for
  optimization stability; the centering is largely cosmetic.)
- "Count the cross-feature reductions in LayerNorm vs RMSNorm. Why does
  that number matter on a GPU?" (Each reduction across the feature dim
  is a synchronization point. One reduction beats two.)
- "RMSNorm has no `bias` (shift) parameter by default. What does that
  cost you in expressivity?" (Essentially nothing — the next linear layer
  has a bias-equivalent capacity. Removing it saves `d_model` parameters
  per norm × `2N+1` norms.)
- "Why `rsqrt` and not `1 / sqrt`?" (Single fused kernel; numerically
  identical but ~2× faster on GPU.)

### Common pitfalls

1. **Subtracting the mean** — that's LayerNorm. RMSNorm uses raw `x**2`,
   not `(x - mean)**2`.
2. **Forgetting `nn.Parameter`** — `self.weight = torch.ones(...)` makes
   it a buffer. The trainable-params test catches this.
3. **`eps` outside the rsqrt** — `rsqrt(mean_sq) + eps` is wrong; it has
   to be `rsqrt(mean_sq + eps)`.
4. **Normalizing over the wrong dim** — must be `dim=-1` (the feature
   dim), not the batch dim.

## On Completion

### Insight

You wrote four lines of math and matched a PyTorch built-in. RMSNorm is
*the* dominant normalization in modern LLMs (Llama, Qwen, Mistral,
DeepSeek) — and the difference from LayerNorm fits in a sentence:
"drop the mean subtraction, drop the bias." Every Qwen3 transformer
block uses RMSNorm twice (pre-attention, pre-FFN), plus once at the
output. You now hold one of the most-called functions in the network.

### Bridge

Next: `rotary-positional-embeddings`. Position information in modern
LLMs isn't added to embeddings — it's *rotated into* the Q and K
vectors. You'll build the rotation table and the apply function.
