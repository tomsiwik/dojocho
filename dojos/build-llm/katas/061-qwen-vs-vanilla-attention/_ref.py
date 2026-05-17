"""Qwen vs Vanilla attention — GQA, side by side."""

import torch
import torch.nn as nn


class VanillaMHA(nn.Module):
    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        assert d_model % n_heads == 0
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads
        self.d_model = d_model
        self.W_query = nn.Linear(d_model, d_model, bias=False)
        self.W_key = nn.Linear(d_model, d_model, bias=False)
        self.W_value = nn.Linear(d_model, d_model, bias=False)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, t, _ = x.shape
        q = self.W_query(x).view(b, t, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.W_key(x).view(b, t, self.n_heads, self.head_dim).transpose(1, 2)
        v = self.W_value(x).view(b, t, self.n_heads, self.head_dim).transpose(1, 2)

        scores = q @ k.transpose(-2, -1)
        mask = torch.triu(torch.ones(t, t, dtype=torch.bool, device=x.device), diagonal=1)
        scores = scores.masked_fill(mask, float("-inf"))
        weights = torch.softmax(scores / (self.head_dim ** 0.5), dim=-1)

        ctx = (weights @ v).transpose(1, 2).contiguous().view(b, t, self.d_model)
        return self.out_proj(ctx)


class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model: int, n_q_heads: int, n_kv_heads: int):
        super().__init__()
        assert d_model % n_q_heads == 0
        assert n_q_heads % n_kv_heads == 0
        self.n_q_heads = n_q_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = d_model // n_q_heads
        self.d_model = d_model
        self.group_size = n_q_heads // n_kv_heads

        self.W_query = nn.Linear(d_model, n_q_heads * self.head_dim, bias=False)
        self.W_key = nn.Linear(d_model, n_kv_heads * self.head_dim, bias=False)
        self.W_value = nn.Linear(d_model, n_kv_heads * self.head_dim, bias=False)
        self.out_proj = nn.Linear(n_q_heads * self.head_dim, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, t, _ = x.shape
        q = self.W_query(x).view(b, t, self.n_q_heads, self.head_dim).transpose(1, 2)
        k = self.W_key(x).view(b, t, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.W_value(x).view(b, t, self.n_kv_heads, self.head_dim).transpose(1, 2)

        k = k.repeat_interleave(self.group_size, dim=1)
        v = v.repeat_interleave(self.group_size, dim=1)

        scores = q @ k.transpose(-2, -1)
        mask = torch.triu(torch.ones(t, t, dtype=torch.bool, device=x.device), diagonal=1)
        scores = scores.masked_fill(mask, float("-inf"))
        weights = torch.softmax(scores / (self.head_dim ** 0.5), dim=-1)

        ctx = (weights @ v).transpose(1, 2).contiguous().view(b, t, self.n_q_heads * self.head_dim)
        return self.out_proj(ctx)
