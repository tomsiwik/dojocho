"""Tests for grouped-query-attention."""

import torch
import torch.nn as nn

D_MODEL = 32
N_Q_HEADS = 4
N_KV_HEADS = 2
HEAD_DIM = D_MODEL // N_Q_HEADS  # 8


def test_gqa_is_module(solution):
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    assert isinstance(gqa, nn.Module)


def test_gqa_forward_shape(solution):
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    B, T = 2, 8
    x = torch.randn(B, T, D_MODEL)
    out = gqa(x)
    assert out.shape == (B, T, D_MODEL)


def test_gqa_kv_projections_are_smaller(solution):
    """W_k and W_v should project to n_kv_heads * head_dim, not d_model."""
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    kv_out_features = N_KV_HEADS * HEAD_DIM  # 16
    linear_layers = [m for m in gqa.modules() if isinstance(m, nn.Linear)]
    out_features = sorted(m.out_features for m in linear_layers)
    # Expect: 2 small KV projections (16 each) + 2 full projections (32 each).
    assert out_features == [kv_out_features, kv_out_features, D_MODEL, D_MODEL]


def test_gqa_param_count_lower_than_mha(solution):
    """At equal d_model and n_q_heads, GQA should have fewer parameters
    than full MHA. MHA's Q,K,V,O are each d_model x d_model (no bias)."""
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    gqa_params = sum(p.numel() for p in gqa.parameters())
    mha_params = 4 * (D_MODEL * D_MODEL)  # Q, K, V, O all square, no bias
    assert gqa_params < mha_params, f"GQA={gqa_params}, MHA={mha_params}"


def test_gqa_param_count_exact(solution):
    """Exact: W_q (d*d) + W_k (d * kv_h * hd) + W_v (...) + W_o (d*d)."""
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    kv_dim = N_KV_HEADS * HEAD_DIM
    expected = (
        D_MODEL * D_MODEL  # W_q
        + D_MODEL * kv_dim  # W_k
        + D_MODEL * kv_dim  # W_v
        + D_MODEL * D_MODEL  # W_o
    )
    assert sum(p.numel() for p in gqa.parameters()) == expected


def test_gqa_is_causal(solution):
    """Future tokens must not influence past outputs. Perturb x[:, T-1, :]
    and verify outputs at all earlier positions are unchanged."""
    torch.manual_seed(0)
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_KV_HEADS)
    gqa.eval()
    B, T = 2, 8
    x = torch.randn(B, T, D_MODEL)
    out_a = gqa(x)

    x_perturbed = x.clone()
    x_perturbed[:, -1, :] += 100.0  # massive change to last position only
    out_b = gqa(x_perturbed)

    # Outputs at positions 0..T-2 should be (approximately) unchanged.
    torch.testing.assert_close(out_a[:, :-1], out_b[:, :-1], atol=1e-5, rtol=1e-4)


def test_gqa_n_kv_must_divide_n_q(solution):
    """Should reject configs where n_kv_heads does not divide n_q_heads."""
    import pytest

    with pytest.raises((AssertionError, ValueError)):
        solution.GQA(d_model=32, n_q_heads=4, n_kv_heads=3)


def test_gqa_handles_mha_special_case(solution):
    """When n_kv_heads == n_q_heads, GQA reduces to MHA (must still run)."""
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=N_Q_HEADS)
    x = torch.randn(2, 6, D_MODEL)
    out = gqa(x)
    assert out.shape == (2, 6, D_MODEL)


def test_gqa_handles_mqa_special_case(solution):
    """When n_kv_heads == 1, GQA reduces to MQA (must still run)."""
    gqa = solution.GQA(d_model=D_MODEL, n_q_heads=N_Q_HEADS, n_kv_heads=1)
    x = torch.randn(2, 6, D_MODEL)
    out = gqa(x)
    assert out.shape == (2, 6, D_MODEL)
