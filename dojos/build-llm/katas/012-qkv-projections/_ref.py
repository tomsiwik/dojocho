"""Reference solution for QKV Projections."""

import torch
import torch.nn as nn


class QKVProjection(nn.Module):
    def __init__(self, d_in: int, d_out: int):
        super().__init__()
        self.W_q = nn.Linear(d_in, d_out, bias=False)
        self.W_k = nn.Linear(d_in, d_out, bias=False)
        self.W_v = nn.Linear(d_in, d_out, bias=False)

    def forward(self, x):
        return self.W_q(x), self.W_k(x), self.W_v(x)
