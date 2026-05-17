"""feed-forward — Per-position MLP for a transformer block.

Wide-then-narrow:  Linear(d, 4d) → GELU → Linear(4d, d)

Applied independently to every token position. Holds roughly 2/3 of a
GPT block's parameters. Output shape == input shape, so the result
slots directly into a residual connection.
"""

import torch
import torch.nn as nn


class FeedForward(nn.Module):
    """Two-layer MLP with 4× hidden expansion and GELU activation.

    Args:
        emb_dim: model/embedding dimension (input and output dim).
    """

    def __init__(self, emb_dim: int):
        super().__init__()
        ...  # implement me

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me
