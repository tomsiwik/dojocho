"""Tests for feed-forward."""

import torch
import torch.nn as nn


def test_ffn_is_module(solution):
    ffn = solution.FeedForward(emb_dim=64)
    assert isinstance(ffn, nn.Module)


def test_ffn_output_shape_matches_input(solution):
    """FFN preserves all leading dims; only feature dim flows through."""
    ffn = solution.FeedForward(emb_dim=32)
    x = torch.randn(2, 5, 32)
    out = ffn(x)
    assert out.shape == x.shape


def test_ffn_works_on_2d_input(solution):
    """The same FFN should work on (B, D) too — Linear is dim-agnostic."""
    ffn = solution.FeedForward(emb_dim=16)
    x = torch.randn(7, 16)
    out = ffn(x)
    assert out.shape == (7, 16)


def test_ffn_has_two_linear_layers(solution):
    """The module should contain exactly two nn.Linear submodules."""
    ffn = solution.FeedForward(emb_dim=8)
    linears = [m for m in ffn.modules() if isinstance(m, nn.Linear)]
    assert len(linears) == 2


def test_ffn_hidden_dim_is_4x(solution):
    """The first linear expands to 4 * emb_dim; the second contracts back."""
    emb_dim = 16
    ffn = solution.FeedForward(emb_dim=emb_dim)
    linears = [m for m in ffn.modules() if isinstance(m, nn.Linear)]
    # Identify by shape: one is (emb_dim → 4*emb_dim), other is reverse.
    shapes = sorted(((m.in_features, m.out_features) for m in linears))
    assert shapes == sorted([(emb_dim, 4 * emb_dim), (4 * emb_dim, emb_dim)])


def test_ffn_param_count(solution):
    """Two Linears with bias: emb_dim*4*emb_dim + 4*emb_dim
                            + 4*emb_dim*emb_dim + emb_dim."""
    emb_dim = 16
    ffn = solution.FeedForward(emb_dim=emb_dim)
    expected = (
        emb_dim * 4 * emb_dim + 4 * emb_dim  # first Linear
        + 4 * emb_dim * emb_dim + emb_dim  # second Linear
    )
    actual = sum(p.numel() for p in ffn.parameters())
    assert actual == expected


def test_ffn_is_nonlinear(solution):
    """If there were no activation, FFN(2x) would equal 2 * FFN(0+) up to bias.
    With GELU in the middle, FFN(2x) != 2 * FFN(x) - FFN(0) for typical inputs.
    """
    torch.manual_seed(0)
    ffn = solution.FeedForward(emb_dim=16)
    x = torch.randn(4, 16)
    out_x = ffn(x)
    out_2x = ffn(2 * x)
    # If linear, out_2x would equal 2 * out_x - ffn(zeros) (bias correction).
    out_zero = ffn(torch.zeros_like(x))
    linear_prediction = 2 * out_x - out_zero
    # They should NOT match (i.e. nonlinearity is present).
    assert not torch.allclose(out_2x, linear_prediction, atol=1e-3)


def test_ffn_backward_produces_gradients(solution):
    """All parameters should receive gradients on backward."""
    ffn = solution.FeedForward(emb_dim=8)
    x = torch.randn(3, 8)
    ffn(x).sum().backward()
    for p in ffn.parameters():
        assert p.grad is not None
