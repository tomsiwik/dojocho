# SENSEI — Qwen vs Vanilla Attention

## Briefing

### Goal

Build two attention modules side-by-side and compare them:

1. **VanillaMHA** — Q, K, V all have `n_heads` heads (the version
   you've seen in `multihead-attention-efficient` and most textbooks).
2. **GroupedQueryAttention** — Q has `n_q_heads`, but K and V have
   `n_kv_heads < n_q_heads`. Each KV head is shared by
   `n_q_heads / n_kv_heads` query heads.

GQA is what Qwen3, Llama 3, Mistral, and most modern open-weight models
actually use. The point of this kata is to *feel* the parameter-count
asymmetry and understand the inference-time tradeoff: smaller K, V
projections → smaller KV cache (next kata).

### Tasks

For each module:
- Standard multi-head reshape choreography
  `(B, T, n_heads, head_dim) → (B, n_heads, T, head_dim)`.
- Scaled-dot-product attention with a causal mask.
- Project back through `out_proj` to `(B, T, d_model)`.

For GQA specifically:
- `W_key` and `W_value` project to `n_kv_heads * head_dim`, *not*
  `n_q_heads * head_dim`.
- Before the `Q @ K^T` matmul, expand K and V from `n_kv_heads` to
  `n_q_heads` using `Tensor.repeat_interleave(group_size, dim=1)`.
- `out_proj` is still `Linear(n_q_heads * head_dim, d_model)` — the
  output dim doesn't shrink, only the KV projection inputs do.

### Hints

- `torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)` is the
  causal mask. `masked_fill(mask, -inf)` then softmax.
- For repeat_interleave: if `k` has shape `(B, n_kv_heads, T, head_dim)`
  and `group_size = n_q_heads // n_kv_heads`, then
  `k.repeat_interleave(group_size, dim=1)` gives `(B, n_q_heads, T, head_dim)`.
- No bias on any Linear here — matches the Qwen3 reference.

## Prerequisites

- `multihead-attention-naive`, `multihead-attention-efficient` — same
  reshape choreography.
- `causal-attention-mask` — for the mask details.

## References

- Raschka build-reasoning ch2, ch5 (Qwen3 architecture detour). The
  `Qwen3 0.6B` model uses GQA with `n_q_heads=16`, `n_kv_heads=8`.
- Ainslie et al. 2023, *"GQA: Training Generalized Multi-Query
  Transformer Models from Multi-Head Checkpoints"* —
  https://arxiv.org/abs/2305.13245
- Reference implementation:
  `reasoning_from_scratch/qwen3.py::GroupedQueryAttention`

## Teaching Approach

**Code-reading first, then Socratic.** Show the student the Qwen3
GroupedQueryAttention source side-by-side with a textbook MHA. Have
them annotate the *three* differences. Then write.

### Socratic prompts

- "Both modules have an `n_heads` for Q. Vanilla uses the same for K
  and V. Qwen uses *fewer* for K and V. What does that change about
  the **memory** footprint of K and V?" (Smaller by `group_size`x.)
- "What does it change about **compute**? Trace through a forward pass
  in your head." (Compute is the same — K, V are repeated up to
  `n_q_heads` before the matmul. The matmul itself does the same work.)
- "Then what's the point?" (KV *cache* — at inference, we store K and V
  for every past token. GQA shrinks that cache by `group_size`x. That's
  the entire game for long-context inference.)
- "When does GQA fail / look bad?" (Training from scratch — many papers
  show small quality drops vs. vanilla MHA. But when you can recover
  quality cheaply via "uptraining" (Ainslie 2023) and the inference
  savings are 4-8x, it's an easy trade.)
- "What's the limit case `n_kv_heads = 1`?" (*Multi-query attention*
  (MQA), the original Shazeer 2019 idea. Even smaller KV cache, more
  quality risk.)

### Common pitfalls

1. **Wrong out_proj input dim** — students size `out_proj` as
   `Linear(n_kv_heads * head_dim, d_model)`. It is `n_q_heads *
   head_dim`, because each query head produced its own context.
2. **Forgetting to expand K, V** — `Q @ K^T` requires matching head
   dims. If you skip `repeat_interleave`, you'll get a broadcasting
   error or silently-wrong shape.
3. **Using `.repeat`** — `.repeat(1, group_size, 1, 1)` tiles the heads
   in the wrong order: head-0, head-1, ..., head-0, head-1, ... You
   want `head-0, head-0, ..., head-1, head-1, ...` — that's
   `.repeat_interleave(group_size, dim=1)`.
4. **Scaling by `d_model**0.5`** — must be `head_dim**0.5`. Each head
   computes scores of dimension `head_dim`.

## On Completion

### Insight

You just built the attention module of every modern open-weight LLM.
The structural change is small — three integer changes (`n_kv_heads`,
the size of `W_key/W_value`, and a `repeat_interleave` call) — but the
inference-cost impact is 4-8x on memory. Architecture papers tend to
have small structural changes with large engineering consequences.
GQA is a textbook example.

### Bridge

`streaming-generation` is a UX-flavored kata: same compute as greedy
greeting, but yields tokens one at a time so the client can render them
as they arrive. After that, `kv-cache-attention` *cashes in* on the GQA
structure: you'll build an attention module that maintains a K/V cache
across calls so that token N+1's forward only does O(1) attention work
on the new token, instead of O(N) on the whole sequence.
