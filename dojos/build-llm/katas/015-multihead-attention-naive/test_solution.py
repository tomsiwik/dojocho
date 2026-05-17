"""Tests for Multi-Head Attention (Naive)."""

import torch
import torch.nn as nn


B, T, D_IN, D_OUT, CTX, N_HEADS = 2, 4, 8, 4, 4, 2


# --- CausalHead -----------------------------------------------------------


def test_head_has_qkv(solution):
    h = solution.CausalHead(D_IN, D_OUT, CTX)
    assert isinstance(h.W_q, nn.Linear)
    assert h.W_q.bias is None


def test_head_registers_mask(solution):
    h = solution.CausalHead(D_IN, D_OUT, CTX)
    assert "mask" in {n for n, _ in h.named_buffers()}


def test_head_forward_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    h = solution.CausalHead(D_IN, D_OUT, CTX)
    out = h(x)
    assert out.shape == (B, T, D_OUT)


def test_head_is_causal(solution):
    """First-position output equals first-position value (only key visible)."""
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    h = solution.CausalHead(D_IN, D_OUT, CTX)
    out = h(x)
    v = h.W_v(x)
    torch.testing.assert_close(out[:, 0, :], v[:, 0, :])


# --- MultiHeadAttentionNaive ---------------------------------------------


def test_mha_uses_modulelist(solution):
    m = solution.MultiHeadAttentionNaive(D_IN, D_OUT, CTX, N_HEADS)
    assert isinstance(m.heads, nn.ModuleList)
    assert len(m.heads) == N_HEADS


def test_mha_output_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.MultiHeadAttentionNaive(D_IN, D_OUT, CTX, N_HEADS)
    out = m(x)
    assert out.shape == (B, T, N_HEADS * D_OUT)


def test_mha_concatenates_head_outputs(solution):
    """The MHA output along the last axis equals torch.cat of per-head
    outputs in head order."""
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.MultiHeadAttentionNaive(D_IN, D_OUT, CTX, N_HEADS)
    out = m(x)
    expected = torch.cat([h(x) for h in m.heads], dim=-1)
    torch.testing.assert_close(out, expected)


def test_mha_heads_have_independent_weights(solution):
    """Each head's W_q must be a different Parameter from the others'."""
    m = solution.MultiHeadAttentionNaive(D_IN, D_OUT, CTX, N_HEADS)
    wqs = [h.W_q.weight for h in m.heads]
    # Same shape but different Parameter objects.
    assert wqs[0] is not wqs[1]
    # And different values (random init).
    assert not torch.allclose(wqs[0], wqs[1])


def test_mha_parameters_registered(solution):
    """All head submodules must register so .parameters() sees them."""
    m = solution.MultiHeadAttentionNaive(D_IN, D_OUT, CTX, N_HEADS)
    n_params = sum(p.numel() for p in m.parameters())
    # Each head: 3 linear layers of d_in*d_out params, no bias.
    expected = N_HEADS * 3 * D_IN * D_OUT
    assert n_params == expected
