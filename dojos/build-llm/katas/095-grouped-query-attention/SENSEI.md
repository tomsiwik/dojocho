# SENSEI — grouped-query-attention

## Briefing

### Goal

Implement Grouped Query Attention (GQA): multiple query heads share each
key/value head. Standard Multi-Head Attention (MHA) has `n_q_heads`
worth of K and V; Multi-Query Attention (MQA) has just 1; GQA sits in
between with `n_kv_heads` of each, where `n_q_heads % n_kv_heads == 0`.
Used in Llama 2, Llama 3, Qwen3, Mistral — basically every modern
open-weight LLM.

### Tasks

Implement `GQA(d_model, n_q_heads, n_kv_heads)` as an `nn.Module`:

1. In `__init__`:
   - Assert `n_q_heads % n_kv_heads == 0` and `d_model % n_q_heads == 0`.
   - Compute `head_dim = d_model // n_q_heads` and
     `group_size = n_q_heads // n_kv_heads`.
   - Create three projections (all `bias=False`):
     - `W_q`: `d_model → n_q_heads * head_dim` (== d_model).
     - `W_k`: `d_model → n_kv_heads * head_dim` (smaller).
     - `W_v`: `d_model → n_kv_heads * head_dim` (smaller).
   - Create `W_o`: `d_model → d_model`.
2. In `forward(x)` for `x.shape == (B, T, d_model)`:
   - Project to Q, K, V; reshape to `(B, T, n_q_heads, head_dim)` and
     `(B, T, n_kv_heads, head_dim)`; transpose to `(B, heads, T, head_dim)`.
   - **Expand K, V** along the heads dim with
     `repeat_interleave(group_size, dim=1)` so they match the Q-head count.
   - Causal scaled dot-product attention: `scores = (Q @ K.T) / sqrt(head_dim)`,
     mask the upper triangle (above diagonal) with `-inf`, softmax, `@ V`.
   - Transpose back, reshape to `(B, T, d_model)`, project through `W_o`.

### Hints

- `repeat_interleave(group_size, dim=1)` duplicates each K/V head
  `group_size` times so the matmul against Q has aligned heads. (Not
  `repeat`, which tiles instead.)
- `torch.triu(torch.ones(T, T, dtype=bool), diagonal=1)` for the causal
  mask. Broadcast to `(1, 1, T, T)`.
- `F.softmax(..., dim=-1)`.
- Verify the parameter count formula in your head before writing the
  test assertion — MHA has 4 × `d_model^2` parameters (Q,K,V,O all
  square). GQA replaces 2 of those with smaller matrices.

## Prerequisites

- `multihead-attention-naive` and `multihead-attention-efficient` katas.
- Comfortable with `reshape`, `transpose(1, 2)`, `view`,
  `repeat_interleave`.

## References

- Raschka *Build a Reasoning Model from Scratch*, Appendix C §C.4, Listing C.4.
- Ainslie et al. (2023), "GQA: Training Generalized Multi-Query Transformer
  Models from Multi-Head Checkpoints" — https://arxiv.org/abs/2305.13245
- Shazeer (2019), "Fast Transformer Decoding: One Write-Head is All You
  Need" (MQA) — https://arxiv.org/abs/1911.02150

## Teaching Approach

Strong Socratic. GQA is the *engineering compromise* of the trio. The
lesson is the trade-off, not the code.

### Socratic prompts

- "MHA has `n` query heads and `n` KV heads. MQA has `n` queries and `1`
  shared KV. GQA has `n` queries and `g` KV heads (1 < g < n). What
  does each optimize for?" (MHA: quality. MQA: memory bandwidth /
  KV-cache size at inference. GQA: best of both — most of MQA's
  inference speedup with most of MHA's quality.)
- "Where in the inference pipeline does the KV-cache size *bite*?"
  (Memory bandwidth dominates autoregressive generation. Smaller KV
  cache → fewer bytes read per generated token → more tokens/sec.)
- "If you have 32 query heads and group size 8, how many KV heads do
  you store? What's the KV-cache memory ratio vs MHA?" (4 KV heads;
  1/8th the K and V cache.)
- "Why `repeat_interleave` and not `repeat`?" (Heads 0–3 must all
  attend against the *same* K/V; interleave gives `[k0,k0,k0,k0,k1,...]`,
  which lines up with `[q0,q1,q2,q3,q4,...]`. `repeat` gives
  `[k0,k1,k2,k3,k0,k1,...]` which scrambles the alignment.)
- "When does GQA *fail* — when is plain MHA still the right answer?"
  (Training-time experiments where inference cost doesn't dominate, or
  very small models where the KV-cache is already tiny.)

### Common pitfalls

1. **Wrong reshape order** — `view(B, T, n_heads, head_dim)` then
   `transpose(1, 2)` is *not* the same as `view(B, n_heads, T, head_dim)`.
   The first is correct; the second scrambles tokens across heads.
2. **`repeat` vs `repeat_interleave`** — see Socratic prompt above. Tests
   may pass shape-wise but produce garbage attention.
3. **Forgetting to mask** — without causal masking, the model peeks at
   future tokens. Output shape will be right; behavior won't.
4. **Missing the scale** — `scores / sqrt(head_dim)`, not `/ sqrt(d_model)`.
5. **bias=True on projections** — modern LLMs (Llama/Qwen) use
   `bias=False`. The param-count test assumes this.

## On Completion

### Insight

You wrote the attention mechanism every billion-parameter open-weight
LLM ships today. The whole story:
- 2017 (Vaswani): MHA — each head has its own K, V.
- 2019 (Shazeer): MQA — one shared K/V for all heads. Fast, slightly worse.
- 2023 (Ainslie): GQA — groups. Recover most of MHA's quality at MQA's
  speed.

Llama 2 70B uses 64 query heads with 8 KV heads (group size 8). Qwen3
0.6B uses 16 query heads with 8 KV groups (group size 2). The lever is
*always* there — it's the cleanest single knob for trading quality
against inference throughput.

### Bridge

Next: `swiglu-ffn`. The other half of every transformer block. After
that, `tiny-qwen-block` assembles all four pieces (RMSNorm + RoPE + GQA
+ SwiGLU) into a working transformer block — the real payoff.
