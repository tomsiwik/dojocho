"""int8-quantization-roundtrip — symmetric per-tensor int8.

Implement quantize / dequantize and measure the round-trip error. This
is the operation behind every "int8 weights" model.
"""

import torch


def quantize_int8(x: torch.Tensor) -> tuple[torch.Tensor, float]:
    """Symmetric per-tensor int8 quantization.

    Args:
        x: 1-D float tensor.

    Returns:
        (q, scale) where
          - q is an int8 tensor of the same shape, values in [-127, 127].
          - scale is a Python float such that x ≈ q.to(float) * scale.

    Edge case: if `x` is all zeros, return `q` all zeros and `scale=0.0`.
    """
    ...  # implement me


def dequantize_int8(q: torch.Tensor, scale: float) -> torch.Tensor:
    """Inverse of `quantize_int8`. Returns a float32 tensor."""
    ...  # implement me
