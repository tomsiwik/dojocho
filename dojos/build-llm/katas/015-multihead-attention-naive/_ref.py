"""Reference solution for Multi-Head Attention (Naive)."""

import torch
import torch.nn as nn


class CausalHead(nn.Module):
    def __init__(self, d_in: int, d_out: int, context_length: int):
        super().__init__()
        self.W_q = nn.Linear(d_in, d_out, bias=False)
        self.W_k = nn.Linear(d_in, d_out, bias=False)
        self.W_v = nn.Linear(d_in, d_out, bias=False)
        self.register_buffer(
            "mask",
            torch.triu(
                torch.ones(context_length, context_length, dtype=torch.bool),
                diagonal=1,
            ),
        )

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


class MultiHeadAttentionNaive(nn.Module):
    def __init__(
        self,
        d_in: int,
        d_out: int,
        context_length: int,
        num_heads: int,
    ):
        super().__init__()
        self.heads = nn.ModuleList(
            [CausalHead(d_in, d_out, context_length) for _ in range(num_heads)]
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.cat([h(x) for h in self.heads], dim=-1)
