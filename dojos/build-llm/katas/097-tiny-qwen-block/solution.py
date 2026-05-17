"""tiny-qwen-block — assemble RMSNorm + RoPE + GQA + SwiGLU into one
Qwen3-style transformer block.

The four building blocks below are PROVIDED — you implemented each in a
prior kata. Your job is the four-line wiring at the bottom:

    TinyQwenBlock = RMSNorm → GQA(with RoPE) → +residual
                    RMSNorm → SwiGLU         → +residual

Stack 28 of these (plus an embedding and an output head) and you have
the Qwen3 0.6B architecture from appendix C.
"""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F


# ---------- provided primitives (your prior katas) -----------------------


class RMSNorm(nn.Module):
    def __init__(self, d_model: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(d_model))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        mean_sq = x.pow(2).mean(dim=-1, keepdim=True)
        return x * torch.rsqrt(mean_sq + self.eps) * self.weight


def precompute_rope_freqs(
    seq_len: int, head_dim: int, base: float = 10000.0
) -> tuple[torch.Tensor, torch.Tensor]:
    inv_freq = 1.0 / (base ** (torch.arange(0, head_dim, 2).float() / head_dim))
    positions = torch.arange(seq_len).float()
    angles = positions[:, None] * inv_freq[None, :]
    angles = torch.cat([angles, angles], dim=-1)
    return torch.cos(angles), torch.sin(angles)


def apply_rope(
    q: torch.Tensor, k: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor
) -> tuple[torch.Tensor, torch.Tensor]:
    T, head_dim = q.shape[-2], q.shape[-1]
    cos_t = cos[:T].unsqueeze(0).unsqueeze(0)
    sin_t = sin[:T].unsqueeze(0).unsqueeze(0)

    def _rot(x: torch.Tensor) -> torch.Tensor:
        x1 = x[..., : head_dim // 2]
        x2 = x[..., head_dim // 2 :]
        return (x * cos_t) + (torch.cat([-x2, x1], dim=-1) * sin_t)

    return _rot(q), _rot(k)


class GQAWithRoPE(nn.Module):
    """Grouped Query Attention with RoPE applied to Q and K, causal mask.

    Same shape contract as plain GQA: (B, T, d_model) -> (B, T, d_model).
    The RoPE cos/sin tables are registered as buffers (not parameters).
    """

    def __init__(
        self,
        d_model: int,
        n_q_heads: int,
        n_kv_heads: int,
        max_seq_len: int,
        rope_base: float = 10000.0,
    ):
        super().__init__()
        assert d_model % n_q_heads == 0
        assert n_q_heads % n_kv_heads == 0

        self.d_model = d_model
        self.n_q_heads = n_q_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = d_model // n_q_heads
        self.group_size = n_q_heads // n_kv_heads
        kv_dim = n_kv_heads * self.head_dim

        self.W_q = nn.Linear(d_model, d_model, bias=False)
        self.W_k = nn.Linear(d_model, kv_dim, bias=False)
        self.W_v = nn.Linear(d_model, kv_dim, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)

        cos, sin = precompute_rope_freqs(max_seq_len, self.head_dim, rope_base)
        self.register_buffer("cos", cos, persistent=False)
        self.register_buffer("sin", sin, persistent=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, _ = x.shape
        q = self.W_q(x).view(B, T, self.n_q_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)

        q, k = apply_rope(q, k, self.cos, self.sin)

        k = k.repeat_interleave(self.group_size, dim=1)
        v = v.repeat_interleave(self.group_size, dim=1)

        scores = q @ k.transpose(-2, -1) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=x.device), 1)
        scores = scores.masked_fill(mask, float("-inf"))
        attn = F.softmax(scores, dim=-1)
        context = (attn @ v).transpose(1, 2).contiguous().view(B, T, self.d_model)
        return self.W_o(context)


class SwiGLU(nn.Module):
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        self.W_gate = nn.Linear(d_model, d_ff, bias=False)
        self.W_up = nn.Linear(d_model, d_ff, bias=False)
        self.W_down = nn.Linear(d_ff, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.W_down(F.silu(self.W_gate(x)) * self.W_up(x))


# ---------- YOUR JOB: assemble the block ----------------------------------


class TinyQwenBlock(nn.Module):
    """One Qwen3-style transformer block.

    Pre-norm: RMSNorm before each sub-block. Two residuals.

        x = x + attn(RMSNorm(x))      # GQA with RoPE
        x = x + ffn(RMSNorm(x))       # SwiGLU
    """

    def __init__(
        self,
        d_model: int,
        n_q_heads: int,
        n_kv_heads: int,
        d_ff: int,
        max_seq_len: int,
        rope_base: float = 10000.0,
    ):
        super().__init__()
        ...  # implement me: norm1, attn, norm2, ffn

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me: two pre-norm sub-blocks, two residual adds
