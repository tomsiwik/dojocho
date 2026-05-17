"""Multi-Head Attention (Efficient).

Same function as the naive ModuleList version, computed with ONE fused
matmul. The trick is reshaping (B, T, d_out) into (B, num_heads, T,
head_dim) so a single batched matmul handles all heads at once.

Shape choreography:
    (B, T, d_in)
  → W_q(x): (B, T, d_out)
  → .view:  (B, T, num_heads, head_dim)
  → .transpose(1, 2): (B, num_heads, T, head_dim)
  → attention math, output (B, num_heads, T, head_dim)
  → .transpose(1, 2): (B, T, num_heads, head_dim)
  → .contiguous().view: (B, T, d_out)
  → out_proj: (B, T, d_out)
"""

import torch
import torch.nn as nn


class MultiHeadAttention(nn.Module):
    def __init__(
        self,
        d_in: int,
        d_out: int,
        context_length: int,
        num_heads: int,
    ):
        super().__init__()
        # Implement me:
        #   assert d_out % num_heads == 0
        #   self.num_heads, self.head_dim, self.d_out
        #   self.W_q / W_k / W_v: nn.Linear(d_in, d_out, bias=False)
        #   self.out_proj:        nn.Linear(d_out, d_out)
        #   register_buffer('mask', triu(ones(ctx, ctx), diagonal=1))
        ...

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B, T, d_in) -> (B, T, d_out)."""
        ...  # implement me
