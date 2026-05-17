"""group-quantization — per-group int8 with one scale per chunk.

Same encoder/decoder as per-tensor int8, applied to fixed-size chunks
of the tensor. The trick behind GPTQ / AWQ / bitsandbytes.
"""

import torch


def quantize_group_int8(
    x: torch.Tensor, group_size: int = 64
) -> tuple[torch.Tensor, torch.Tensor]:
    """Per-group symmetric int8 quantization.

    Args:
        x: 1-D float tensor; len(x) must be divisible by `group_size`.
        group_size: number of consecutive elements per group.

    Returns:
        (q, scales) where
          - q has the same shape as x and dtype int8.
          - scales has shape (n_groups,) and is float.
    """
    ...  # implement me


def dequantize_group_int8(
    q: torch.Tensor, scales: torch.Tensor, group_size: int = 64
) -> torch.Tensor:
    """Inverse of `quantize_group_int8`. Returns float32 tensor."""
    ...  # implement me
