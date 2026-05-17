"""grouped-query-attention — GQA, the modern LLM attention default.

Standard MHA gives every query head its own K and V projection. GQA
shares K and V across groups of query heads, cutting KV-cache size by
`group_size`. Used by Llama 2/3, Qwen3, Mistral, DeepSeek — basically
every modern open-weight LLM.

Configuration in this kata (small enough for fast tests):
    d_model=32, n_q_heads=4, n_kv_heads=2  →  head_dim=8, group_size=2
"""

import torch
import torch.nn as nn


class GQA(nn.Module):
    """Grouped Query Attention with causal masking.

    Args:
        d_model: model embedding dim. Must be divisible by n_q_heads.
        n_q_heads: number of query heads.
        n_kv_heads: number of key/value heads. Must divide n_q_heads.
    """

    def __init__(self, d_model: int, n_q_heads: int, n_kv_heads: int):
        super().__init__()
        ...  # implement me:
        #   - assert divisibility
        #   - compute head_dim, group_size
        #   - create W_q, W_k, W_v, W_o (all bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Run causal GQA on x of shape (B, T, d_model)."""
        ...  # implement me
