# SENSEI — KV-Cache Attention

## Briefing

### Goal

Build the optimization that makes LLM chat *feel* real-time. The naive
autoregressive loop recomputes K and V for every past token at every
step. The KV cache stores them so each new token only computes its own
K and V, and reuses everything else.

You will implement single-head causal attention with the contract:

    out, new_cache = attn(x, kv_cache=None)

When `kv_cache is None`: one-shot forward over `x`, return output and
the (K, V) of all of `x`'s positions for the caller to cache.

When `kv_cache is not None`: compute Q, K, V only for the new `x`,
**concatenate** the new K, V onto the cached ones, attend, return the
output and the updated cache.

### Tasks

1. **No-cache path:**
   - Compute Q, K, V from `x`.
   - Causal-mask + scaled dot-product attention.
   - Return `(output, (K, V))` where K, V are shape `(B, T, d_model)`.

2. **With-cache path:**
   - Compute Q, K, V for `x` *only* — shapes `(B, T_new, d_model)`.
   - `K_full = cat([K_prev, K_new], dim=1)`, same for V.
   - Compute scores `Q @ K_full^T` — shape `(B, T_new, T_past + T_new)`.
   - **Causal mask is rectangular here.** Query token `i` (0-indexed
     among the new tokens) can attend to all past tokens plus new
     tokens at positions `0..i`. That is: `mask[i, j] = True` when
     `j > T_past + i` (forbidden).
   - Return `(output, (K_full, V_full))`.

### Hints

- The causal mask for the cached case is non-square. Build it once and
  understand the shape: `(T_new, T_past + T_new)`. A common pattern:

      mask = torch.ones(T_new, T_past + T_new, dtype=torch.bool, device=x.device)
      mask = torch.triu(mask, diagonal=1 + T_past)

- Scale by `d_model**0.5` (single head).
- `T_past = K_prev.shape[1]` when there's a cache; 0 otherwise. You can
  branch on `kv_cache is None` and reuse a unified scoring path.
- `torch.inference_mode()` won't help correctness, only speed — the
  tests assert exact values.

## Prerequisites

- `multihead-attention-efficient` — same scoring math.
- `qwen-vs-vanilla-attention` — KV cache exists to amortize K/V; GQA
  exists to shrink it. Now you build the cache itself.

## References

- Raschka build-reasoning ch2 §2.8 — `generate_text_basic_stream_cache`
  shows the *call* side; this kata is the *implementation* side.
- Raschka, *"Understanding and Coding the KV Cache in LLMs from Scratch"* —
  https://magazine.sebastianraschka.com/p/coding-the-kv-cache-in-llms
- `reasoning_from_scratch/qwen3.py::GroupedQueryAttention.forward`
  (lines 178-220) — the production reference, with cache + GQA + RoPE.

## Teaching Approach

**Strong Socratic + derive the optimization.** Don't reveal the cache
trick. Derive it.

### Socratic prompts

(Best asked in order, before any code is written.)

- "To generate token 101, the model attends Q_101 against K_1..K_100.
  To generate token 102, the model attends Q_102 against K_1..K_101.
  What is **repeated** between those two computations?" (K_1..K_100,
  computed from the same inputs. Same for V.)
- "If K_1..K_100 are exactly the same in both calls, what would let us
  avoid recomputing them?" (Cache them. Hand them to the next call.)
- "What does the cache *contain*? Not Q — why?" (Q for token 101 is
  irrelevant when computing token 102. Q is a per-step query, K and V
  are 'memory' for past tokens.)
- "What new shape does the causal mask have when Q is 1 token but K is
  T_past + 1 tokens?" (Rectangular: `(1, T_past + 1)`. All positions
  are allowed because the single Q row is the newest token and may
  attend to all past tokens.)
- (After it works) "Asymptotic cost — without cache, generating N
  tokens is O(N²). With cache?" (O(N) — each step does one new K and V
  computation plus an O(T) attention. Sum from 1 to N gives O(N²) for
  attention scoring, but the *projection* costs drop from O(N²) to
  O(N).)

### Common pitfalls

1. **Causal mask off-by-one.** When T_past=3 and T_new=1, the single
   query row attends to positions 0, 1, 2, 3. The mask should be all
   `False` (i.e., everything allowed). `torch.triu(..., diagonal=1 + T_past)`
   on a (1, 4) ones-tensor produces an all-False mask — exactly right.
2. **Stale Q when caching.** Don't try to cache Q. Q is always
   recomputed from the new `x` each call.
3. **Wrong concat axis.** K and V are `(B, T, d_model)` here (single
   head, no head-dim split). Concat along `dim=1` (the time axis).
4. **Mutating the cache in place** — students sometimes use `cache[0]
   = ...`. The contract is "return a *new* cache." Functional style is
   safer for backward-compat with `torch.compile` etc.

## On Completion

### Insight

You just implemented the single most impactful inference optimization
in modern LLM serving. vLLM, TGI, llama.cpp, MLX, every production
inference engine — they all build on this. The interesting variations
are (a) how the cache is stored (PagedAttention, vLLM), (b) how it is
shared across requests (prefix caching), and (c) how it is shrunk
(GQA, MQA — the previous kata).

### Bridge

`chat-template-qwen` is the final piece of "use a real model" — the
**text protocol** between user/system/assistant. Wrong template →
wrong outputs, because the model was trained on a specific exact
string format and assumes that exact format at inference. You'll
implement the Qwen3 chat template from scratch.
