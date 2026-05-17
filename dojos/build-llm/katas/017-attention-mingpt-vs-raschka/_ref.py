"""Reference solution for Attention: minGPT vs Raschka.

This file ONLY redefines `same_function`. The two reference module
classes (RaschkaMHA, MinGPTCSA) live in the kata's solution.py stub
and are imported here from the same module path at test time. To make
the reference standalone, we re-import them via importlib trickery is
overkill — we instead just re-define the classes here as well.
"""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F


class RaschkaMHA(nn.Module):
    def __init__(self, d_in, d_out, context_length, num_heads,
                 dropout=0.0, qkv_bias=False):
        super().__init__()
        assert d_out % num_heads == 0
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
            torch.triu(torch.ones(context_length, context_length), diagonal=1),
        )

    def forward(self, x):
        B, T, _ = x.shape
        q = self.W_q(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        scores = q @ k.transpose(-2, -1)
        scores = scores.masked_fill(self.mask.bool()[:T, :T], float("-inf"))
        weights = torch.softmax(scores / (self.head_dim ** 0.5), dim=-1)
        weights = self.dropout(weights)
        ctx = (weights @ v).transpose(1, 2).contiguous().view(B, T, self.d_out)
        return self.out_proj(ctx)


class MinGPTCSA(nn.Module):
    def __init__(self, n_embd, n_head, context_length,
                 attn_pdrop=0.0, resid_pdrop=0.0):
        super().__init__()
        assert n_embd % n_head == 0
        self.n_head = n_head
        self.n_embd = n_embd
        self.c_attn = nn.Linear(n_embd, 3 * n_embd)
        self.c_proj = nn.Linear(n_embd, n_embd)
        self.attn_dropout = nn.Dropout(attn_pdrop)
        self.resid_dropout = nn.Dropout(resid_pdrop)
        self.register_buffer(
            "bias",
            torch.tril(torch.ones(context_length, context_length)).view(
                1, 1, context_length, context_length
            ),
        )

    def forward(self, x):
        B, T, C = x.shape
        head_dim = C // self.n_head
        q, k, v = self.c_attn(x).split(self.n_embd, dim=2)
        q = q.view(B, T, self.n_head, head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_head, head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_head, head_dim).transpose(1, 2)
        att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(head_dim))
        att = att.masked_fill(self.bias[:, :, :T, :T] == 0, float("-inf"))
        att = F.softmax(att, dim=-1)
        att = self.attn_dropout(att)
        y = (att @ v).transpose(1, 2).contiguous().view(B, T, C)
        y = self.resid_dropout(self.c_proj(y))
        return y


def same_function(d_in, num_heads, context_length, batch):
    """The three structural differences:
      1. QKV layers: Raschka has 3 separate Linear(d_in, d_out, bias=False);
         minGPT has 1 fused Linear(n_embd, 3*n_embd) split with .split.
      2. Mask convention: Raschka uses triu (cells to MASK are 1) and
         masks where mask is True; minGPT uses tril (cells to KEEP are
         1) and masks where bias == 0. Same effect, opposite convention.
      3. Dropout: Raschka has ONE dropout (after softmax). minGPT has
         TWO: attn_dropout (after softmax) and resid_dropout (after the
         output projection).
    """
    torch.manual_seed(0)
    rasch = RaschkaMHA(d_in, d_in, context_length, num_heads, dropout=0.0)
    mingpt = MinGPTCSA(d_in, num_heads, context_length,
                       attn_pdrop=0.0, resid_pdrop=0.0)

    with torch.no_grad():
        # Stack QKV weights into c_attn.weight along dim=0 (out_features).
        # Order: q, k, v (matches .split(n_embd, dim=2)).
        fused_w = torch.cat(
            [rasch.W_q.weight, rasch.W_k.weight, rasch.W_v.weight], dim=0
        )
        mingpt.c_attn.weight.copy_(fused_w)
        # Raschka has no QKV bias; zero out c_attn.bias.
        mingpt.c_attn.bias.zero_()
        # Output projection: copy directly.
        mingpt.c_proj.weight.copy_(rasch.out_proj.weight)
        mingpt.c_proj.bias.copy_(rasch.out_proj.bias)

    rasch.eval()
    mingpt.eval()

    with torch.no_grad():
        r_out = rasch(batch)
        m_out = mingpt(batch)

    diff = (r_out - m_out).abs().max().item()
    return r_out, m_out, diff
