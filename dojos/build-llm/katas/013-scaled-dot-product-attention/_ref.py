"""Reference solution for Scaled Dot-Product Attention."""

import torch
import torch.nn as nn


def scaled_dot_product_attention(
    Q: torch.Tensor,
    K: torch.Tensor,
    V: torch.Tensor,
) -> torch.Tensor:
    d_k = K.shape[-1]
    scores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)
    weights = torch.softmax(scores, dim=-1)
    return weights @ V


class SelfAttention(nn.Module):
    def __init__(self, d_in: int, d_out: int):
        super().__init__()
        self.W_q = nn.Linear(d_in, d_out, bias=False)
        self.W_k = nn.Linear(d_in, d_out, bias=False)
        self.W_v = nn.Linear(d_in, d_out, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return scaled_dot_product_attention(
            self.W_q(x), self.W_k(x), self.W_v(x)
        )
