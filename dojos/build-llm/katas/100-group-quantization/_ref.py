"""Reference solution for group-quantization."""

import torch


def quantize_group_int8(
    x: torch.Tensor, group_size: int = 64
) -> tuple[torch.Tensor, torch.Tensor]:
    assert x.ndim == 1
    assert x.shape[0] % group_size == 0, "length must be divisible by group_size"
    n_groups = x.shape[0] // group_size
    x_g = x.reshape(n_groups, group_size)

    max_abs = x_g.abs().amax(dim=1)  # (n_groups,)
    scales = max_abs / 127.0  # (n_groups,)
    # Guard against zero-norm groups: divide by a safe value, output stays 0.
    safe = torch.where(scales > 0, scales, torch.ones_like(scales))
    q = torch.round(x_g / safe[:, None]).clamp(-127, 127).to(torch.int8)
    return q.reshape(-1), scales


def dequantize_group_int8(
    q: torch.Tensor, scales: torch.Tensor, group_size: int = 64
) -> torch.Tensor:
    n_groups = q.shape[0] // group_size
    q_g = q.reshape(n_groups, group_size).to(torch.float32)
    return (q_g * scales[:, None]).reshape(-1)
