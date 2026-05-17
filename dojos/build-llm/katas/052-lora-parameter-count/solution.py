"""lora-parameter-count — measure trainable vs total parameter counts.

Two tiny helpers that make LoRA's headline number ("48× fewer trainable
params") reproducible on any nn.Module. They drive every "trainable %"
plot you'll ever see in a fine-tuning paper.
"""

import torch.nn as nn


def count_trainable(model: nn.Module) -> int:
    """Total number of *trainable* scalar parameters in `model`.

    Sums `p.numel()` over every `nn.Parameter` with `requires_grad=True`.
    """
    ...  # implement me


def count_total(model: nn.Module) -> int:
    """Total number of scalar parameters in `model`, trainable or not."""
    ...  # implement me
