"""Tests for QKV Projections."""

import torch
import torch.nn as nn


B, T, D_IN, D_OUT = 2, 4, 8, 8


def _toy_batch() -> torch.Tensor:
    torch.manual_seed(0)
    return torch.randn(B, T, D_IN)


def test_has_three_linear_layers(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    assert isinstance(m.W_q, nn.Linear)
    assert isinstance(m.W_k, nn.Linear)
    assert isinstance(m.W_v, nn.Linear)


def test_linear_shapes(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    for layer in (m.W_q, m.W_k, m.W_v):
        assert layer.in_features == D_IN
        assert layer.out_features == D_OUT


def test_no_bias(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    assert m.W_q.bias is None
    assert m.W_k.bias is None
    assert m.W_v.bias is None


def test_forward_returns_triple(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    out = m(_toy_batch())
    assert isinstance(out, tuple)
    assert len(out) == 3


def test_forward_shapes(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    q, k, v = m(_toy_batch())
    assert q.shape == (B, T, D_OUT)
    assert k.shape == (B, T, D_OUT)
    assert v.shape == (B, T, D_OUT)


def test_qkv_use_distinct_weights(solution):
    """Q, K, V must come from different linear layers, not the same one."""
    m = solution.QKVProjection(D_IN, D_OUT)
    # Different parameters → different outputs on random input.
    x = _toy_batch()
    q, k, v = m(x)
    assert not torch.allclose(q, k)
    assert not torch.allclose(q, v)
    assert not torch.allclose(k, v)


def test_q_matches_W_q(solution):
    """Q must come from W_q (not from W_k or W_v)."""
    m = solution.QKVProjection(D_IN, D_OUT)
    x = _toy_batch()
    q, _, _ = m(x)
    torch.testing.assert_close(q, m.W_q(x))


def test_k_matches_W_k(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    x = _toy_batch()
    _, k, _ = m(x)
    torch.testing.assert_close(k, m.W_k(x))


def test_v_matches_W_v(solution):
    m = solution.QKVProjection(D_IN, D_OUT)
    x = _toy_batch()
    _, _, v = m(x)
    torch.testing.assert_close(v, m.W_v(x))


def test_parameters_are_trainable(solution):
    """All three weight matrices must show up in .parameters() and
    require grad — they need to be learnable."""
    m = solution.QKVProjection(D_IN, D_OUT)
    params = list(m.parameters())
    assert len(params) == 3
    assert all(p.requires_grad for p in params)
