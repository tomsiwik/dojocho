"""lora-linear-layer — wrap an nn.Linear with a low-rank trainable update.

LoRA replaces a full-rank weight update with `ΔW = (alpha/rank) · B @ A`
where A: (in_features, rank), B: (rank, out_features). The original
weight `W_old` is frozen; only A and B are trained.

Forward pass:
    y = linear(x) + scaling * (x @ A @ B)

where `scaling = alpha / rank`. At init, B = 0, so the wrapped layer
produces identical output to the unwrapped one — handy for sanity.
"""

import math

import torch
import torch.nn as nn


class LoRALinear(nn.Module):
    """nn.Linear wrapped with a low-rank trainable update.

    Args:
        linear: The pretrained Linear layer to adapt. Its weight (and
            bias, if present) are frozen in-place.
        rank: Inner dimension r of the low-rank update.
        alpha: Scaling factor. The effective contribution is
            (alpha / rank) * (x @ A @ B).
    """

    def __init__(self, linear: nn.Linear, rank: int, alpha: float):
        super().__init__()
        ...  # implement me

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me
