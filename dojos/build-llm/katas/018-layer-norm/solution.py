"""layer-norm — Implement LayerNorm from scratch.

Normalizes activations across the last dimension (the embedding dim) to
zero mean and unit variance, then applies a learned affine transform
(scale * x + shift). Matches torch.nn.LayerNorm bit-for-bit when
configured the same way.

This is the first real building block of a transformer. You will use it
twice in every transformer block (pre-attention, pre-FFN) plus once
after the last block — so 2N + 1 times in an N-layer GPT.
"""

import torch
import torch.nn as nn


class LayerNorm(nn.Module):
    """Layer normalization over the last dimension of the input.

    Args:
        emb_dim: size of the normalized dimension (the feature/embedding
            dim, typically `d_model`).
    """

    def __init__(self, emb_dim: int):
        super().__init__()
        ...  # implement me: set self.eps, self.scale, self.shift

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Normalize `x` over its last dim, then apply affine transform."""
        ...  # implement me
