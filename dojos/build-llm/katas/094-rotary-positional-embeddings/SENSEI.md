# SENSEI — rotary-positional-embeddings

## Briefing

### Goal

Implement Rotary Position Embeddings (RoPE). Unlike the original GPT,
which *adds* a learned position vector to the token embedding, RoPE
*rotates* the query and key vectors by an angle proportional to the
token's position. The dot product `q·k` then depends only on the
*relative* position of the two tokens — a clean, parameter-free way to
encode position.

### Tasks

1. Implement `precompute_rope_freqs(seq_len, head_dim, base=10000)` →
   returns `(cos, sin)` tables of shape `(seq_len, head_dim)` each.
   - Inverse frequencies: `inv_freq = 1 / (base ** (arange(0, head_dim, 2) / head_dim))`.
     Shape `(head_dim // 2,)`.
   - Angles: `positions[:, None] * inv_freq[None, :]`, shape `(seq_len, head_dim // 2)`.
   - Duplicate to full head_dim: `torch.cat([angles, angles], dim=-1)`.
   - Return `cos(angles), sin(angles)`.
2. Implement `apply_rope(q, k, cos, sin)`:
   - `q, k` shape: `(B, n_heads, T, head_dim)`.
   - Slice cos/sin to first `T` positions; reshape to `(1, 1, T, head_dim)`.
   - For each tensor `x`: split into halves `x1 = x[..., :h/2]`, `x2 = x[..., h/2:]`,
     form `rotated = cat([-x2, x1], dim=-1)`, then `out = x*cos + rotated*sin`.
   - Apply to both q and k. Return `(q_rot, k_rot)`.

### Hints

- This is the **split-halves** layout (Hugging Face / Raschka style), not
  the interleaved layout from the original paper. They're mathematically
  equivalent; this one is just easier to write.
- `torch.arange(0, head_dim, 2)` gives the even indices: `0, 2, 4, ...`.
- `inv_freq.float() / head_dim` — make sure you don't integer-divide.
- `head_dim` must be even (assert it).
- The rotation `x1, x2 → (x1*cos - x2*sin), (x2*cos + x1*sin)` is exactly
  what the `cat([-x2, x1])` trick computes — work it out on paper if it's
  not obvious.

## Prerequisites

- `positional-embeddings` kata (you've used absolute position embeddings).
- Comfortable with tensor slicing, broadcasting, `cat`, `unsqueeze`.

## References

- Raschka *Build a Reasoning Model from Scratch*, Appendix C §C.3, Listing C.3.
- Su et al. (2021), "RoFormer: Enhanced Transformer with Rotary
  Position Embedding" — https://arxiv.org/abs/2104.09864
- EleutherAI's RoPE explainer — https://blog.eleuther.ai/rotary-embeddings/

## Teaching Approach

Worked example + Socratic. The matrix-math intuition (2D rotations on
pairs of dimensions) is essential; the code is short once that clicks.

### Socratic prompts

- "Absolute positional embeddings add a vector per position. RoPE
  rotates Q and K. After the rotation, what does `q_m · k_n` depend on:
  m, n, or `m - n`?" (Only `m - n`. The relative angle is the position
  signal.)
- "Why does that matter for generalization?" (A model trained at length
  4096 can attend over distance 100 between positions 0 and 100, *or*
  positions 3000 and 3100 — the dot product is identical. Absolute
  embeddings have no such guarantee outside the training range.)
- "Where in the attention pipeline does RoPE apply — before or after
  Q/K projection? Before or after splitting into heads?" (After
  projection, after reshaping to `(B, n_heads, T, head_dim)`, before the
  `q @ k.T` matmul.)
- "Why precompute cos/sin instead of computing them in the forward
  pass?" (They depend only on position and head_dim, not on the input
  data — pure waste to recompute.)

### Common pitfalls

1. **Integer division in `inv_freq`** — `arange(...)/head_dim` on
   integer tensors is `//`. Cast with `.float()`.
2. **Wrong layout for cos/sin** — must be `(seq_len, head_dim)` after
   the `cat([angles, angles])` step. Without the cat, the broadcast
   against `x` won't line up.
3. **Forgetting to slice cos/sin to current T** — the table is
   precomputed for max seq_len; if you pass full table, shapes mismatch.
4. **Confusing the two RoPE layouts** — the interleaved (even/odd
   pairs) layout uses a different rotation pattern. Pick one and stick
   with it.
5. **Applying RoPE to V** — only Q and K get rotated. V stays as-is.

## On Completion

### Insight

You just built one of the most quietly-revolutionary pieces of the
modern LLM stack. RoPE has zero learned parameters yet generalizes to
sequence lengths longer than training; it composes cleanly with KV
caching (each new token just gets its own rotation); and it's the
foundation that context-extension methods (YaRN, Position
Interpolation) build on. Llama, Qwen, Mistral, DeepSeek — all RoPE.

### Bridge

Next: `grouped-query-attention`. You'll plug `apply_rope` into the
Q/K projections of a GQA module — the same place every Qwen3
transformer block calls it, 28 times per forward pass.
