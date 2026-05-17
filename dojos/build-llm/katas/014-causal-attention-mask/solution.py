"""Causal Attention Mask.

Block each position from attending to future positions by setting
upper-triangular scores to -inf before softmax. softmax(-inf) = 0,
so those positions contribute zero weight without breaking the
row-sum-to-1 invariant.
"""

import torch
import torch.nn as nn


def causal_mask(T: int) -> torch.Tensor:
    """Boolean (T, T) mask. mask[i, j] = True iff j > i (cells to mask)."""
    ...  # implement me


def apply_causal_mask(
    scores: torch.Tensor, mask: torch.Tensor
) -> torch.Tensor:
    """Return a NEW tensor with masked positions set to -inf."""
    ...  # implement me


def causal_attention(
    Q: torch.Tensor,
    K: torch.Tensor,
    V: torch.Tensor,
) -> torch.Tensor:
    """Full scaled-dot-product attention with causal mask.

    Shapes: Q, K, V are (B, T, d). Output is (B, T, d).
    """
    ...  # implement me


class CausalAttention(nn.Module):
    """Single-head causal self-attention.

    Stores `mask` as a registered buffer so it moves with .to(device).
    """

    def __init__(self, d_in: int, d_out: int, context_length: int):
        super().__init__()
        # Implement me:
        #   - self.W_q, self.W_k, self.W_v as nn.Linear(d_in, d_out, bias=False)
        #   - self.register_buffer('mask', causal_mask(context_length))
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_in)  ->  context: (B, T, d_out).

        Use self.mask[:T, :T] to support T smaller than context_length.
        """
        ...  # implement me
