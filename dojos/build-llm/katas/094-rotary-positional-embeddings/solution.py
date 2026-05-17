"""rotary-positional-embeddings — RoPE for query/key vectors.

RoPE rotates each pair of dimensions in Q and K by an angle that depends
on the token's position. After rotation, the dot product `q_m · k_n`
depends only on the *relative* offset `m - n` — no learned parameters,
and it generalizes to sequence lengths longer than training.

This implementation uses the "split-halves" layout (Hugging Face / Qwen
style), which is mathematically equivalent to the interleaved layout from
the original paper.
"""

import torch


def precompute_rope_freqs(
    seq_len: int, head_dim: int, base: float = 10000.0
) -> tuple[torch.Tensor, torch.Tensor]:
    """Precompute cos/sin tables for RoPE.

    Returns:
        cos, sin: each of shape (seq_len, head_dim).
    """
    ...  # implement me


def apply_rope(
    q: torch.Tensor,
    k: torch.Tensor,
    cos: torch.Tensor,
    sin: torch.Tensor,
) -> tuple[torch.Tensor, torch.Tensor]:
    """Apply RoPE rotation to query and key tensors.

    Args:
        q, k: shape (B, n_heads, T, head_dim). head_dim must be even.
        cos, sin: precomputed tables of shape (seq_len_max, head_dim),
            where seq_len_max >= T.

    Returns:
        (q_rot, k_rot): same shapes as inputs.
    """
    ...  # implement me
