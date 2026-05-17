"""Multi-Head Attention (Naive).

Stack N independent causal-attention heads. Each head has its own
W_q/W_k/W_v and learns its own attention pattern. The forward pass
runs the heads sequentially and concatenates outputs along the feature
axis.

Output dim: num_heads * d_out  (not d_out).
"""

import torch
import torch.nn as nn


class CausalHead(nn.Module):
    """One causal self-attention head. Same contract as the previous
    kata's CausalAttention.
    """

    def __init__(self, d_in: int, d_out: int, context_length: int):
        super().__init__()
        # Implement me: W_q, W_k, W_v (Linear, no bias) and a registered
        # buffer `mask` of shape (context_length, context_length).
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_in) -> (B, T, d_out)."""
        ...  # implement me


class MultiHeadAttentionNaive(nn.Module):
    """Wrap N CausalHead instances in an nn.ModuleList named `heads`.
    Concatenate per-head outputs along the last axis.
    """

    def __init__(
        self,
        d_in: int,
        d_out: int,
        context_length: int,
        num_heads: int,
    ):
        super().__init__()
        # Implement me: self.heads = nn.ModuleList([...])
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_in) -> (B, T, num_heads * d_out)."""
        ...  # implement me
