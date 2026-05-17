"""Reference solution for Causal Attention Mask."""

import torch
import torch.nn as nn


def causal_mask(T: int) -> torch.Tensor:
    return torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)


def apply_causal_mask(
    scores: torch.Tensor, mask: torch.Tensor
) -> torch.Tensor:
    return scores.masked_fill(mask, float("-inf"))


def causal_attention(
    Q: torch.Tensor,
    K: torch.Tensor,
    V: torch.Tensor,
) -> torch.Tensor:
    T = Q.shape[-2]
    d_k = K.shape[-1]
    scores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)
    scores = apply_causal_mask(scores, causal_mask(T))
    weights = torch.softmax(scores, dim=-1)
    return weights @ V


class CausalAttention(nn.Module):
    def __init__(self, d_in: int, d_out: int, context_length: int):
        super().__init__()
        self.W_q = nn.Linear(d_in, d_out, bias=False)
        self.W_k = nn.Linear(d_in, d_out, bias=False)
        self.W_v = nn.Linear(d_in, d_out, bias=False)
        self.register_buffer("mask", causal_mask(context_length))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, _ = x.shape
        q = self.W_q(x)
        k = self.W_k(x)
        v = self.W_v(x)
        d_k = k.shape[-1]
        scores = q @ k.transpose(-2, -1) / (d_k ** 0.5)
        scores = scores.masked_fill(self.mask[:T, :T], float("-inf"))
        weights = torch.softmax(scores, dim=-1)
        return weights @ v
