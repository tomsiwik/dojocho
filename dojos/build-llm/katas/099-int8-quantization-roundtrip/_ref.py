"""Reference solution for int8-quantization-roundtrip."""

import torch


def quantize_int8(x: torch.Tensor) -> tuple[torch.Tensor, float]:
    max_abs = float(x.abs().max())
    if max_abs == 0.0:
        return torch.zeros_like(x, dtype=torch.int8), 0.0
    scale = max_abs / 127.0
    q = torch.round(x / scale).clamp(-127, 127).to(torch.int8)
    return q, scale


def dequantize_int8(q: torch.Tensor, scale: float) -> torch.Tensor:
    return q.to(torch.float32) * scale
