"""transformer-block — Assemble a pre-LayerNorm transformer block.

Two sub-blocks, each in its own residual wrapper:
  1) LayerNorm → Causal MHA → Dropout → + residual
  2) LayerNorm → FeedForward → Dropout → + residual

The CausalMultiHeadAttention is provided here so this kata is
self-contained. Your job is the TransformerBlock assembly.
"""

import torch
import torch.nn as nn


# ----- Provided scaffolding (chapter 3 kata material) -----

class CausalMultiHeadAttention(nn.Module):
    """Causal (masked) multi-head self-attention.

    You implemented something like this in chapter 3 katas. It's provided
    here so this kata stays focused on the transformer block assembly.

    Input:  (B, T, d_in)
    Output: (B, T, d_out)
    """

    def __init__(
        self,
        d_in: int,
        d_out: int,
        context_length: int,
        num_heads: int,
        dropout: float = 0.0,
        qkv_bias: bool = False,
    ):
        super().__init__()
        assert d_out % num_heads == 0, "d_out must be divisible by num_heads"
        self.d_out = d_out
        self.num_heads = num_heads
        self.head_dim = d_out // num_heads

        self.W_q = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_k = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_v = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.out_proj = nn.Linear(d_out, d_out)
        self.dropout = nn.Dropout(dropout)
        self.register_buffer(
            "mask",
            torch.triu(torch.ones(context_length, context_length), diagonal=1).bool(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, t, _ = x.shape
        q = self.W_q(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        scores = q @ k.transpose(-2, -1) / (self.head_dim ** 0.5)
        scores = scores.masked_fill(self.mask[:t, :t], float("-inf"))
        attn = torch.softmax(scores, dim=-1)
        attn = self.dropout(attn)
        out = (attn @ v).transpose(1, 2).contiguous().view(b, t, self.d_out)
        return self.out_proj(out)


class FeedForward(nn.Module):
    """Wide-then-narrow MLP (Linear → GELU → Linear, hidden = 4 × emb_dim).

    Provided here so this kata is self-contained, but you've already
    built this in the `feed-forward` kata.
    """

    def __init__(self, emb_dim: int):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(emb_dim, 4 * emb_dim),
            nn.GELU(approximate="tanh"),
            nn.Linear(4 * emb_dim, emb_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)


# ----- Your code goes below -----

class TransformerBlock(nn.Module):
    """Pre-LayerNorm transformer block.

    Args:
        cfg: dict with keys 'emb_dim', 'n_heads', 'context_length',
             'drop_rate'.
    """

    def __init__(self, cfg: dict):
        super().__init__()
        ...  # implement me — create att, ff, norm1, norm2, drop_shortcut

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me — two residual sub-blocks, pre-norm each
