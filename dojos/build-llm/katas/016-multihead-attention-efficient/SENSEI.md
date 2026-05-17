# SENSEI — Multi-Head Attention (Efficient)

## Briefing

### Goal

Re-implement multi-head attention with **one big matmul** instead of
`num_heads` small ones. The mathematics is identical to the naive
version; the difference is reshape choreography that lets a single
batched matmul compute all heads in parallel on the GPU.

This is the class you'll actually use in chapter 4 to build the GPT
model. It is also the version where the syntax is most opaque, so the
kata is heavy on Parsons-style "fix the order" thinking about the
reshape sequence.

### Tasks

Implement `MultiHeadAttention(d_in, d_out, context_length, num_heads)`:

1. `__init__`:
   - Assert `d_out % num_heads == 0`.
   - `self.num_heads = num_heads`
   - `self.head_dim = d_out // num_heads`
   - `self.d_out = d_out`
   - `self.W_q`, `self.W_k`, `self.W_v` — `nn.Linear(d_in, d_out,
     bias=False)`. **One** linear of size `d_out`, not `num_heads`
     separate `head_dim` ones.
   - `self.out_proj` — `nn.Linear(d_out, d_out)` (default bias=True).
   - Registered buffer `mask` — `triu(ones(ctx, ctx), diagonal=1)`.

2. `forward(x)` — the reshape dance:
   ```
   x                       (B, T, d_in)
   → Q = W_q(x)            (B, T, d_out)
   → Q.view                (B, T, num_heads, head_dim)
   → Q.transpose(1, 2)     (B, num_heads, T, head_dim)
   ... same for K, V ...
   → scores = Q @ K^T      (B, num_heads, T, T)
   → mask + softmax + scale
   → attn_weights @ V      (B, num_heads, T, head_dim)
   → transpose(1, 2)       (B, T, num_heads, head_dim)
   → contiguous + view     (B, T, d_out)
   → out_proj              (B, T, d_out)
   ```

### Hints

- After `transpose`, the tensor is **not contiguous in memory**. You
  must call `.contiguous()` before `.view(B, T, d_out)` or PyTorch
  raises a "view size is not compatible" error.
- `K.transpose(-2, -1)` swaps the last two dims; works for the 4-D
  tensor `(B, num_heads, T, head_dim)` to give `(B, num_heads,
  head_dim, T)`.
- Use `self.mask.bool()[:T, :T]` (slice for short sequences). PyTorch
  broadcasts the `(T, T)` mask over the `(B, num_heads, T, T)` scores
  automatically.
- `head_dim` is what you scale by: `attn_scores / head_dim**0.5`.

## Prerequisites

- `multihead-attention-naive` — same math, less clever.

## References

- Raschka chapter 3 §3.6.2, listing 3.5 — the reference
  `MultiHeadAttention` class.
- Raschka chapter 3 §3.6.2 figures 3.26–3.27 — the visual story of
  "one big W_q matrix that splits internally."
- `Tensor.view`, `Tensor.transpose`, `Tensor.contiguous`:
  https://pytorch.org/docs/stable/tensor_view.html

## Teaching Approach

**Parsons-style for the reshape sequence + Socratic for the speedup.**
The reshape sequence is the only unfamiliar bit; everything else is
identical to the previous kata. If the student is stuck, get them to
print `.shape` *between every step* of the forward.

### Socratic prompts

- "Naive multi-head used `N` linear layers of size `d_in × head_dim`
  each. This version uses one layer of size `d_in × d_out`. Count
  parameters in both. Same? Different?" (Same: `N * d_in * head_dim ==
  d_in * d_out`.)
- "If the parameter count is the same, where is the speedup?" (One
  big matmul beats N small ones because of GPU kernel-launch overhead
  and better tensor-core utilization. The math doesn't change; the
  *scheduling* of the math does.)
- "Why `.view(B, T, num_heads, head_dim)` and not `.view(B, T,
  head_dim, num_heads)`?" (Because the projection writes head outputs
  *contiguously* in memory: head-0's outputs are positions 0..head_dim,
  head-1's are head_dim..2*head_dim, etc. Reshape order has to match
  memory order.)
- "After the attention math, you have `(B, num_heads, T, head_dim)`.
  Why transpose back to `(B, T, num_heads, head_dim)` before merging?"
  (You want each *token* to have all `num_heads * head_dim = d_out`
  features adjacent in memory before the final `.view(B, T, d_out)`.)
- "Why `.contiguous()` before the final `.view`?" (Transpose returns a
  view with non-trivial stride; `.view` requires contiguous memory.
  Try removing it and read the error.)
- "What is `out_proj` for? The naive version doesn't have it."
  (A learned mix of the per-head outputs — lets the model learn how
  much to listen to each head per output dimension. It's optional but
  standard.)

### Common pitfalls

1. **`d_out` not divisible by `num_heads`** — assert this in
   `__init__` early so the error is loud.
2. **Forgetting `.contiguous()`** — gives a runtime error that doesn't
   mention transpose; surprising the first time.
3. **Wrong transpose dims** — `K.transpose(1, 3)` is shape-correct but
   *wrong* (it permutes heads with head_dim). Use `transpose(-2, -1)`
   or `transpose(2, 3)`.
4. **Scaling by `d_out` instead of `head_dim`** — each head's `d_k` is
   `head_dim`, not `d_out`. Wrong scale, slower convergence.
5. **Treating `out_proj` as optional, forgetting it entirely** — tests
   for it explicitly. The naive kata didn't have it; this one does.

## On Completion

### Insight

Same function, less time. You learned to think about
*memory layout* as a separate concern from *computation*. Transformers
are heavy users of this trick — `view` and `transpose` show up in
*every* attention implementation, from minGPT to PyTorch's built-in
`F.scaled_dot_product_attention` to Flash-Attention. You'll see this
exact reshape pattern again every time you read a transformer codebase.

### Bridge

Kata `attention-mingpt-vs-raschka` is a *code-reading* kata: open both
Raschka's `MultiHeadAttention` and Karpathy's `CausalSelfAttention`
side by side. They compute the same function with three structural
differences. Find them. Then write a check that proves the two produce
equal outputs given matched weights.
