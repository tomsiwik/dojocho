"""Reference solution for Last Token vs Pooling."""

import torch
import torch.nn as nn


def last_token_pool(x: torch.Tensor) -> torch.Tensor:
    return x[:, -1, :]


def mean_pool(x: torch.Tensor, mask: torch.Tensor | None = None) -> torch.Tensor:
    if mask is None:
        return x.mean(dim=1)
    mask = mask.to(x.dtype)
    num = (x * mask.unsqueeze(-1)).sum(dim=1)
    denom = mask.sum(dim=1, keepdim=True).clamp(min=1.0)
    return num / denom


class AttentionPool(nn.Module):
    def __init__(self, d_model: int):
        super().__init__()
        self.query = nn.Parameter(torch.randn(d_model))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        scores = x @ self.query  # (B, T)
        weights = torch.softmax(scores, dim=-1)  # (B, T)
        return (weights.unsqueeze(-1) * x).sum(dim=1)
