"""QKV Projections.

The three trainable linear maps that turn raw embeddings into queries,
keys, and values. No attention yet — just the projections.

The role specialization is the point: every token plays three roles,
each with its own learned transform.
"""

import torch
import torch.nn as nn


class QKVProjection(nn.Module):
    """Projects (B, T, d_in) into (Q, K, V), each (B, T, d_out)."""

    def __init__(self, d_in: int, d_out: int):
        super().__init__()
        # Implement me: three nn.Linear(d_in, d_out, bias=False) layers,
        # named exactly W_q, W_k, W_v.
        ...

    def forward(
        self, x: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """Return (Q, K, V), each of shape (B, T, d_out)."""
        ...  # implement me
