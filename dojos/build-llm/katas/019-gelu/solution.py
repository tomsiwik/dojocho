"""gelu — Implement GELU (tanh approximation) used by GPT-2.

GELU(x) ≈ 0.5 * x * (1 + tanh( sqrt(2/π) * (x + 0.044715 * x^3) ))

This is the activation function used between the two linear layers of
the FeedForward block in every transformer layer of GPT-2 (and BERT,
and many others). It is the only nonlinearity in the per-position
computation; everything else is matmul + add.
"""

import torch
import torch.nn as nn


def gelu(x: torch.Tensor) -> torch.Tensor:
    """GELU (tanh approximation) as a pure function."""
    ...  # implement me


class GELU(nn.Module):
    """nn.Module wrapper around gelu(); plays nicely with nn.Sequential."""

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me
