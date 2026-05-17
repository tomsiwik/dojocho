"""KV-Cache attention.

The naive autoregressive loop recomputes K and V for *every* past
token at every step:

    step 1: forward(prompt[0..N])         → compute K, V for 0..N
    step 2: forward(prompt[0..N+1])       → recompute K, V for 0..N + new
    step 3: forward(prompt[0..N+2])       → recompute K, V for 0..N+1 + new
    ...

But K and V for positions 0..N never change between steps! The KV cache
*stores* them and only computes K, V for the new token each step.

This kata builds a **single-head causal attention** module with KV-cache
support. The contract:

    out, new_cache = attn(x, kv_cache=None)

- If `kv_cache is None`: standard forward over `x` (which may contain
  many tokens). Returns the output and the K, V tensors for *all* of
  x's positions, so they can be cached for next step.
- If `kv_cache is not None`: compute Q, K, V only for `x` (which may be
  just 1 new token), then **append** the new K, V to the cached ones
  and run attention. Return the output and the *updated* cache.

The test asserts that running attention one token at a time with the
cache produces the same result as running it on the full sequence at
once.

Key invariant: the cache is `(K, V)` where each is shape
`(B, num_cached_tokens, head_dim)`.
"""

import torch
import torch.nn as nn


D_MODEL = 16


class KVCacheAttention(nn.Module):
    """Single-head causal attention with optional KV cache.

    Single head keeps the test arithmetic readable; the same pattern
    generalizes trivially to multi-head and to GQA.
    """

    def __init__(self, d_model: int = D_MODEL):
        super().__init__()
        self.d_model = d_model
        self.W_query = nn.Linear(d_model, d_model, bias=False)
        self.W_key = nn.Linear(d_model, d_model, bias=False)
        self.W_value = nn.Linear(d_model, d_model, bias=False)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x: torch.Tensor, kv_cache=None):
        """Causal attention forward, with optional KV cache.

        Args:
            x: (B, T_new, d_model). T_new is the number of *new* tokens
               to process this call (often 1 in incremental decoding).
            kv_cache: None on first call, or a tuple (K_prev, V_prev)
               where each is (B, T_past, d_model).

        Returns:
            output: (B, T_new, d_model) — attention output for the new
                tokens, attending over (past + new) tokens with a
                causal mask that lets each new token see all past tokens
                plus the new tokens at-or-before its own position.
            new_cache: (K_full, V_full) where each is
                (B, T_past + T_new, d_model). Pass this to the next call.
        """
        ...  # implement me
