"""Tests for qwen-vs-vanilla-attention."""

import pytest
import torch


B, T, D_MODEL = 2, 8, 64
N_HEADS = 8           # for vanilla MHA
N_Q_HEADS = 8         # for GQA
N_KV_HEADS = 2        # for GQA (4 query heads share each KV head)


# --- Vanilla MHA ---------------------------------------------------------


def test_vanilla_output_shape(solution):
    torch.manual_seed(0)
    m = solution.VanillaMHA(D_MODEL, N_HEADS)
    x = torch.randn(B, T, D_MODEL)
    out = m(x)
    assert out.shape == (B, T, D_MODEL)


def test_vanilla_causal(solution):
    """Position 0 cannot depend on future positions."""
    torch.manual_seed(0)
    m = solution.VanillaMHA(D_MODEL, N_HEADS)
    m.eval()
    x1 = torch.randn(B, T, D_MODEL)
    x2 = x1.clone()
    x2[:, 1:, :] = torch.randn(B, T - 1, D_MODEL)
    with torch.inference_mode():
        out1 = m(x1)
        out2 = m(x2)
    torch.testing.assert_close(out1[:, 0, :], out2[:, 0, :])


def test_vanilla_param_count(solution):
    """4 linears of d_model x d_model, no bias."""
    m = solution.VanillaMHA(D_MODEL, N_HEADS)
    n = sum(p.numel() for p in m.parameters())
    assert n == 4 * D_MODEL * D_MODEL


# --- GQA -----------------------------------------------------------------


def test_gqa_output_shape(solution):
    torch.manual_seed(0)
    m = solution.GroupedQueryAttention(D_MODEL, N_Q_HEADS, N_KV_HEADS)
    x = torch.randn(B, T, D_MODEL)
    out = m(x)
    assert out.shape == (B, T, D_MODEL)


def test_gqa_causal(solution):
    torch.manual_seed(0)
    m = solution.GroupedQueryAttention(D_MODEL, N_Q_HEADS, N_KV_HEADS)
    m.eval()
    x1 = torch.randn(B, T, D_MODEL)
    x2 = x1.clone()
    x2[:, 1:, :] = torch.randn(B, T - 1, D_MODEL)
    with torch.inference_mode():
        out1 = m(x1)
        out2 = m(x2)
    torch.testing.assert_close(out1[:, 0, :], out2[:, 0, :])


def test_gqa_fewer_params_than_vanilla(solution):
    """GQA shrinks W_key and W_value by (n_q_heads / n_kv_heads). With
    n_q=8, n_kv=2, W_key and W_value are 4x smaller than MHA's."""
    mha = solution.VanillaMHA(D_MODEL, N_HEADS)
    gqa = solution.GroupedQueryAttention(D_MODEL, N_Q_HEADS, N_KV_HEADS)

    n_mha = sum(p.numel() for p in mha.parameters())
    n_gqa = sum(p.numel() for p in gqa.parameters())
    assert n_gqa < n_mha


def test_gqa_param_count_exact(solution):
    """W_q + out_proj = 2 * d_model^2; W_k + W_v = 2 * d_model * n_kv * head_dim."""
    m = solution.GroupedQueryAttention(D_MODEL, N_Q_HEADS, N_KV_HEADS)
    head_dim = D_MODEL // N_Q_HEADS
    expected = (
        2 * D_MODEL * D_MODEL                     # W_query + out_proj
        + 2 * D_MODEL * N_KV_HEADS * head_dim     # W_key + W_value
    )
    n = sum(p.numel() for p in m.parameters())
    assert n == expected


def test_gqa_reduces_to_mha_when_kv_equals_q(solution):
    """When n_kv_heads == n_q_heads, GQA *is* MHA structurally — same
    parameter count as vanilla."""
    gqa_full = solution.GroupedQueryAttention(D_MODEL, N_HEADS, N_HEADS)
    mha = solution.VanillaMHA(D_MODEL, N_HEADS)
    n_gqa = sum(p.numel() for p in gqa_full.parameters())
    n_mha = sum(p.numel() for p in mha.parameters())
    assert n_gqa == n_mha


def test_gqa_assertions(solution):
    """n_q_heads must be divisible by n_kv_heads, d_model divisible by n_q_heads."""
    with pytest.raises(AssertionError):
        solution.GroupedQueryAttention(D_MODEL, 8, 3)  # 8 % 3 != 0
    with pytest.raises(AssertionError):
        solution.GroupedQueryAttention(63, 8, 2)      # 63 % 8 != 0
