"""Tests for Scaled Dot-Product Attention."""

import torch
import torch.nn as nn


B, T, D_IN, D_OUT = 2, 4, 8, 8


def _toy_qkv() -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    torch.manual_seed(0)
    Q = torch.randn(B, T, D_OUT)
    K = torch.randn(B, T, D_OUT)
    V = torch.randn(B, T, D_OUT)
    return Q, K, V


# --- Pure function --------------------------------------------------------


def test_pure_fn_output_shape(solution):
    Q, K, V = _toy_qkv()
    out = solution.scaled_dot_product_attention(Q, K, V)
    assert out.shape == V.shape


def test_pure_fn_matches_reference(solution):
    Q, K, V = _toy_qkv()
    out = solution.scaled_dot_product_attention(Q, K, V)
    d_k = K.shape[-1]
    scores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)
    weights = torch.softmax(scores, dim=-1)
    expected = weights @ V
    torch.testing.assert_close(out, expected)


def test_pure_fn_uses_scale(solution):
    """Without the 1/sqrt(d_k) scale, the result would differ for d_k=8."""
    Q, K, V = _toy_qkv()
    out = solution.scaled_dot_product_attention(Q, K, V)
    unscaled = torch.softmax(Q @ K.transpose(-2, -1), dim=-1) @ V
    # Scaled and unscaled should produce different outputs.
    assert not torch.allclose(out, unscaled, atol=1e-4)


def test_pure_fn_softmax_along_keys(solution):
    """Internally the attention weights are softmaxed over the key axis."""
    Q, K, V = _toy_qkv()
    out = solution.scaled_dot_product_attention(Q, K, V)
    # The output equals (weights @ V). Reconstruct weights and check.
    d_k = K.shape[-1]
    weights = torch.softmax(Q @ K.transpose(-2, -1) / d_k ** 0.5, dim=-1)
    torch.testing.assert_close(weights @ V, out)
    # Row-sum-1 invariant.
    torch.testing.assert_close(weights.sum(dim=-1), torch.ones(B, T))


# --- Module ---------------------------------------------------------------


def test_module_has_qkv_layers(solution):
    m = solution.SelfAttention(D_IN, D_OUT)
    assert isinstance(m.W_q, nn.Linear)
    assert isinstance(m.W_k, nn.Linear)
    assert isinstance(m.W_v, nn.Linear)
    assert m.W_q.bias is None


def test_module_forward_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.SelfAttention(D_IN, D_OUT)
    out = m(x)
    assert out.shape == (B, T, D_OUT)


def test_module_uses_pure_function(solution):
    """The module's output should equal the pure-fn output when fed the
    module's own Q/K/V."""
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.SelfAttention(D_IN, D_OUT)
    out = m(x)
    q = m.W_q(x)
    k = m.W_k(x)
    v = m.W_v(x)
    expected = solution.scaled_dot_product_attention(q, k, v)
    torch.testing.assert_close(out, expected)
