"""Tests for Multi-Head Attention (Efficient)."""

import pytest
import torch
import torch.nn as nn


B, T, D_IN, D_OUT, CTX, N_HEADS = 2, 4, 8, 8, 4, 2
HEAD_DIM = D_OUT // N_HEADS


# --- structural ----------------------------------------------------------


def test_has_W_qkv(solution):
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    assert isinstance(m.W_q, nn.Linear)
    assert m.W_q.in_features == D_IN
    assert m.W_q.out_features == D_OUT
    assert m.W_q.bias is None


def test_has_out_proj(solution):
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    assert isinstance(m.out_proj, nn.Linear)
    assert m.out_proj.in_features == D_OUT
    assert m.out_proj.out_features == D_OUT


def test_stores_head_dim(solution):
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    assert m.num_heads == N_HEADS
    assert m.head_dim == HEAD_DIM


def test_asserts_divisibility(solution):
    """d_out=7, num_heads=2 must raise (not divisible)."""
    with pytest.raises(AssertionError):
        solution.MultiHeadAttention(D_IN, 7, CTX, 2)


def test_mask_registered_as_buffer(solution):
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    assert "mask" in {n for n, _ in m.named_buffers()}


# --- forward shape -------------------------------------------------------


def test_forward_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    out = m(x)
    assert out.shape == (B, T, D_OUT)


def test_forward_handles_shorter_T(solution):
    torch.manual_seed(0)
    x = torch.randn(B, 2, D_IN)  # T=2 < CTX=4
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    out = m(x)
    assert out.shape == (B, 2, D_OUT)


# --- semantics: causal + scale -------------------------------------------


def test_forward_matches_reference(solution):
    """Reference implementation following Raschka listing 3.5."""
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)

    # Reference computation using the same parameters.
    q = m.W_q(x).view(B, T, N_HEADS, HEAD_DIM).transpose(1, 2)
    k = m.W_k(x).view(B, T, N_HEADS, HEAD_DIM).transpose(1, 2)
    v = m.W_v(x).view(B, T, N_HEADS, HEAD_DIM).transpose(1, 2)

    scores = q @ k.transpose(-2, -1)
    mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
    scores = scores.masked_fill(mask, float("-inf"))
    weights = torch.softmax(scores / (HEAD_DIM ** 0.5), dim=-1)
    ctx = (weights @ v).transpose(1, 2).contiguous().view(B, T, D_OUT)
    expected = m.out_proj(ctx)

    out = m(x)
    torch.testing.assert_close(out, expected)


def test_forward_first_token_causal(solution):
    """Position 0 only attends to position 0 → output dependent only on
    V[:, 0, :] (then mixed by out_proj). Different inputs at position
    1..T-1 must not change position 0's pre-out_proj context."""
    torch.manual_seed(0)
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)

    x1 = torch.randn(B, T, D_IN)
    x2 = x1.clone()
    x2[:, 1:, :] = torch.randn(B, T - 1, D_IN)  # change future tokens

    out1 = m(x1)
    out2 = m(x2)
    # Position 0 must be identical despite future tokens differing.
    torch.testing.assert_close(out1[:, 0, :], out2[:, 0, :])


# --- parameter count -----------------------------------------------------


def test_parameter_count(solution):
    """3 Linear(d_in,d_out,bias=False) + 1 Linear(d_out,d_out,bias=True)."""
    m = solution.MultiHeadAttention(D_IN, D_OUT, CTX, N_HEADS)
    n = sum(p.numel() for p in m.parameters())
    expected = 3 * D_IN * D_OUT + (D_OUT * D_OUT + D_OUT)
    assert n == expected
