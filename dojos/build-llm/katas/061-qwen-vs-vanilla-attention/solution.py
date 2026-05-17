"""Qwen vs Vanilla attention — GQA, side by side.

Vanilla multi-head attention (MHA) computes Q, K and V with the same
number of heads (`n_heads`). Modern open-weight models (Qwen3, Llama 3,
Mistral) use **Grouped-Query Attention** (GQA): Q has `n_q_heads`, but
K and V have `n_kv_heads < n_q_heads`. Each KV head is *shared* by
`n_q_heads / n_kv_heads` query heads.

Why: the KV cache (next kata) is the dominant memory cost at inference
for long sequences. Fewer KV heads → smaller cache. Quality is nearly
identical to vanilla MHA at the same total head count.

You will implement both as `nn.Module`s with the same shape contract:
    (B, T, d_model) -> (B, T, d_model)
both causal-masked. The test then asserts:
- output shapes match
- GQA has fewer parameters than MHA (because W_key, W_value are
  smaller)
- GQA reduces to MHA when n_kv_heads == n_q_heads
"""

import torch
import torch.nn as nn


class VanillaMHA(nn.Module):
    """Standard multi-head attention with causal mask.

    All of Q, K, V have shape (B, n_heads, T, head_dim).
    """

    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        # Implement me:
        #   - assert d_model % n_heads == 0
        #   - self.n_heads, self.head_dim
        #   - W_query, W_key, W_value: Linear(d_model, d_model, bias=False)
        #   - out_proj: Linear(d_model, d_model, bias=False)
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_model) -> (B, T, d_model). Causal-masked."""
        ...  # implement me


class GroupedQueryAttention(nn.Module):
    """Grouped-Query Attention with causal mask.

    Q has shape (B, n_q_heads, T, head_dim).
    K, V have shape (B, n_kv_heads, T, head_dim).
    Each KV head is repeated (n_q_heads // n_kv_heads) times before the
    attention matmul.
    """

    def __init__(self, d_model: int, n_q_heads: int, n_kv_heads: int):
        super().__init__()
        # Implement me:
        #   - assert d_model % n_q_heads == 0
        #   - assert n_q_heads % n_kv_heads == 0
        #   - self.n_q_heads, self.n_kv_heads, self.head_dim
        #   - W_query: Linear(d_model, n_q_heads * head_dim, bias=False)
        #   - W_key:   Linear(d_model, n_kv_heads * head_dim, bias=False)
        #   - W_value: Linear(d_model, n_kv_heads * head_dim, bias=False)
        #   - out_proj: Linear(n_q_heads * head_dim, d_model, bias=False)
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_model) -> (B, T, d_model). Causal-masked.

        Use Tensor.repeat_interleave(group_size, dim=1) to expand K and
        V from n_kv_heads to n_q_heads before scoring.
        """
        ...  # implement me
