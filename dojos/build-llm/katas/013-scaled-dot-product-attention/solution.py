"""Scaled Dot-Product Attention.

The formula at the heart of every transformer:

    Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V

The 1/sqrt(d_k) scale exists to keep softmax out of saturation as d_k
grows. See SENSEI.md for the numerical experiment.
"""

import torch
import torch.nn as nn


def scaled_dot_product_attention(
    Q: torch.Tensor,
    K: torch.Tensor,
    V: torch.Tensor,
) -> torch.Tensor:
    """Pure function. Q, K, V are (..., T, d). Returns (..., T, d)."""
    ...  # implement me


class SelfAttention(nn.Module):
    """Single-head self-attention. Wraps three Linear projections and
    delegates the attention math to `scaled_dot_product_attention`.
    """

    def __init__(self, d_in: int, d_out: int):
        super().__init__()
        # Implement me: W_q, W_k, W_v as nn.Linear(d_in, d_out, bias=False).
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_in)  ->  context: (B, T, d_out)."""
        ...  # implement me
