"""Reference implementation for rotary-positional-embeddings."""

import torch


def precompute_rope_freqs(
    seq_len: int, head_dim: int, base: float = 10000.0
) -> tuple[torch.Tensor, torch.Tensor]:
    assert head_dim % 2 == 0, "head_dim must be even"
    inv_freq = 1.0 / (
        base ** (torch.arange(0, head_dim, 2).float() / head_dim)
    )  # (head_dim // 2,)
    positions = torch.arange(seq_len).float()  # (seq_len,)
    angles = positions[:, None] * inv_freq[None, :]  # (seq_len, head_dim // 2)
    angles = torch.cat([angles, angles], dim=-1)  # (seq_len, head_dim)
    return torch.cos(angles), torch.sin(angles)


def apply_rope(
    q: torch.Tensor,
    k: torch.Tensor,
    cos: torch.Tensor,
    sin: torch.Tensor,
) -> tuple[torch.Tensor, torch.Tensor]:
    B, n_heads, T, head_dim = q.shape
    assert head_dim % 2 == 0

    cos_t = cos[:T].unsqueeze(0).unsqueeze(0)  # (1, 1, T, head_dim)
    sin_t = sin[:T].unsqueeze(0).unsqueeze(0)

    def _rotate(x: torch.Tensor) -> torch.Tensor:
        x1 = x[..., : head_dim // 2]
        x2 = x[..., head_dim // 2 :]
        rotated = torch.cat([-x2, x1], dim=-1)
        return (x * cos_t) + (rotated * sin_t)

    return _rotate(q), _rotate(k)
