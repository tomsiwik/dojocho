"""Reference implementation for grouped-query-attention."""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F


class GQA(nn.Module):
    def __init__(self, d_model: int, n_q_heads: int, n_kv_heads: int):
        super().__init__()
        assert d_model % n_q_heads == 0, "d_model must be divisible by n_q_heads"
        assert n_q_heads % n_kv_heads == 0, "n_kv_heads must divide n_q_heads"

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

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, _ = x.shape

        q = self.W_q(x).view(B, T, self.n_q_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)

        # Expand K, V to match Q's head count.
        k = k.repeat_interleave(self.group_size, dim=1)
        v = v.repeat_interleave(self.group_size, dim=1)

        # Causal scaled dot-product attention.
        scores = q @ k.transpose(-2, -1) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=x.device), diagonal=1)
        scores = scores.masked_fill(mask, float("-inf"))
        attn = F.softmax(scores, dim=-1)
        context = attn @ v  # (B, n_q_heads, T, head_dim)

        context = context.transpose(1, 2).contiguous().view(B, T, self.d_model)
        return self.W_o(context)
