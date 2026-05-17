"""Attention: minGPT vs Raschka.

A code-reading kata. Two real-world implementations of causal
multi-head self-attention are provided below — adapted faithfully from:
  - Raschka, LLMs-from-scratch ch03 (mha.py / listing 3.5)
  - Karpathy, minGPT (CausalSelfAttention in model.py)

Your job is to:
  (1) read both classes,
  (2) name the three structural differences (write them in the
      docstring of `same_function`),
  (3) implement `same_function` so the two classes provably compute
      the same output given matched weights.
"""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F


# --- Raschka-style (from LLMs-from-scratch/ch03/.../mha.py) --------------


class RaschkaMHA(nn.Module):
    """Three separate Q/K/V Linear layers; upper-triangular mask (triu);
    single attention dropout. Output projection at the end.
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
            torch.triu(
                torch.ones(context_length, context_length), diagonal=1
            ),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, _ = x.shape
        q = self.W_q(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(B, T, self.num_heads, self.head_dim).transpose(1, 2)

        scores = q @ k.transpose(-2, -1)
        scores = scores.masked_fill(
            self.mask.bool()[:T, :T], float("-inf")
        )
        weights = torch.softmax(scores / (self.head_dim ** 0.5), dim=-1)
        weights = self.dropout(weights)

        ctx = (weights @ v).transpose(1, 2).contiguous().view(B, T, self.d_out)
        return self.out_proj(ctx)


# --- Karpathy-style (from minGPT/mingpt/model.py) -------------------------


class MinGPTCSA(nn.Module):
    """One fused QKV Linear (c_attn); lower-triangular `bias` mask (tril);
    two dropouts (attention + residual). c_proj for output projection.

    Names match minGPT's `CausalSelfAttention`.
    """

    def __init__(
        self,
        n_embd: int,
        n_head: int,
        context_length: int,
        attn_pdrop: float = 0.0,
        resid_pdrop: float = 0.0,
    ):
        super().__init__()
        assert n_embd % n_head == 0
        self.n_head = n_head
        self.n_embd = n_embd

        # one fused QKV projection
        self.c_attn = nn.Linear(n_embd, 3 * n_embd)
        # output projection
        self.c_proj = nn.Linear(n_embd, n_embd)
        # regularization (note: TWO dropouts in minGPT)
        self.attn_dropout = nn.Dropout(attn_pdrop)
        self.resid_dropout = nn.Dropout(resid_pdrop)
        # mask: lower-triangular ones; 1 = "keep" cell.
        self.register_buffer(
            "bias",
            torch.tril(
                torch.ones(context_length, context_length)
            ).view(1, 1, context_length, context_length),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.shape
        head_dim = C // self.n_head

        # one matmul -> three tensors via split
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


# --- The kata -------------------------------------------------------------


def same_function(
    d_in: int,
    num_heads: int,
    context_length: int,
    batch: torch.Tensor,
) -> tuple[torch.Tensor, torch.Tensor, float]:
    """Show that RaschkaMHA and MinGPTCSA compute the same function.

    The three structural differences between them are:
      1. (write your answer here)
      2. (write your answer here)
      3. (write your answer here)

    Steps:
      - Instantiate both classes with d_in == n_embd == d_in_arg,
        num_heads == n_head == num_heads_arg, same context_length,
        and ALL dropouts set to 0.0.
      - Copy weights from Raschka into minGPT:
          * Stack W_q.weight, W_k.weight, W_v.weight along dim=0 ->
            c_attn.weight.
          * Set c_attn.bias to zeros (Raschka has no QKV bias).
          * Copy out_proj.weight, out_proj.bias -> c_proj.weight,
            c_proj.bias.
      - Set both modules to .eval().
      - Run both on `batch` (shape (B, T, d_in)).
      - Return (raschka_out, mingpt_out, max_abs_diff).
    """
    ...  # implement me
