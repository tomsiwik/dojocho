"""Simplified Self-Attention.

Attention with no trainable weights, no Q/K/V, no scale, no mask. Just
the skeleton: each token is a similarity-weighted average of all tokens.

Input shape: (T, d)
Output shape: (T, d)
"""

import torch


def attention_scores(x: torch.Tensor) -> torch.Tensor:
    """Pairwise dot-product scores. Shape: (T, d) -> (T, T)."""
    ...  # implement me


def attention_weights(scores: torch.Tensor) -> torch.Tensor:
    """Row-wise softmax. Each row sums to 1."""
    ...  # implement me


def simplified_self_attention(x: torch.Tensor) -> torch.Tensor:
    """Compose: scores -> weights -> weighted average of x.

    Shape: (T, d) -> (T, d).
    """
    ...  # implement me
