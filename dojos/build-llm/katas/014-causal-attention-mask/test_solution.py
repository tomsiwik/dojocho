"""Tests for Causal Attention Mask."""

import torch
import torch.nn as nn


B, T, D_IN, D_OUT, CTX = 2, 4, 8, 8, 4


# --- causal_mask ---------------------------------------------------------


def test_causal_mask_shape(solution):
    m = solution.causal_mask(5)
    assert m.shape == (5, 5)


def test_causal_mask_is_bool(solution):
    m = solution.causal_mask(4)
    assert m.dtype == torch.bool


def test_causal_mask_pattern(solution):
    """True strictly above the diagonal."""
    m = solution.causal_mask(4)
    expected = torch.tensor(
        [
            [False, True, True, True],
            [False, False, True, True],
            [False, False, False, True],
            [False, False, False, False],
        ]
    )
    torch.testing.assert_close(m, expected)


# --- apply_causal_mask ---------------------------------------------------


def test_apply_mask_sets_neg_inf(solution):
    scores = torch.ones(4, 4)
    mask = solution.causal_mask(4)
    out = solution.apply_causal_mask(scores, mask)
    assert torch.isinf(out[0, 1]) and out[0, 1] < 0
    assert torch.isinf(out[1, 3]) and out[1, 3] < 0


def test_apply_mask_keeps_unmasked(solution):
    scores = torch.full((4, 4), 7.0)
    mask = solution.causal_mask(4)
    out = solution.apply_causal_mask(scores, mask)
    # Diagonal and below are untouched.
    for i in range(4):
        for j in range(i + 1):
            assert out[i, j].item() == 7.0


def test_apply_mask_softmax_yields_lower_triangular_weights(solution):
    scores = torch.randn(4, 4)
    mask = solution.causal_mask(4)
    masked = solution.apply_causal_mask(scores, mask)
    weights = torch.softmax(masked, dim=-1)
    # Above-diagonal weights are zero; rows sum to 1.
    for i in range(4):
        for j in range(i + 1, 4):
            assert weights[i, j].item() == 0.0
    torch.testing.assert_close(weights.sum(dim=-1), torch.ones(4))


# --- causal_attention (pure fn) ------------------------------------------


def test_causal_attention_shape(solution):
    torch.manual_seed(0)
    Q = torch.randn(B, T, D_OUT)
    K = torch.randn(B, T, D_OUT)
    V = torch.randn(B, T, D_OUT)
    out = solution.causal_attention(Q, K, V)
    assert out.shape == (B, T, D_OUT)


def test_causal_attention_matches_reference(solution):
    torch.manual_seed(0)
    Q = torch.randn(B, T, D_OUT)
    K = torch.randn(B, T, D_OUT)
    V = torch.randn(B, T, D_OUT)
    out = solution.causal_attention(Q, K, V)

    d_k = K.shape[-1]
    scores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)
    mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
    scores = scores.masked_fill(mask, float("-inf"))
    weights = torch.softmax(scores, dim=-1)
    expected = weights @ V
    torch.testing.assert_close(out, expected)


def test_causal_first_token_only_sees_self(solution):
    """Output for position 0 must equal V[:, 0, :] (only key it can see)."""
    torch.manual_seed(0)
    Q = torch.randn(B, T, D_OUT)
    K = torch.randn(B, T, D_OUT)
    V = torch.randn(B, T, D_OUT)
    out = solution.causal_attention(Q, K, V)
    torch.testing.assert_close(out[:, 0, :], V[:, 0, :])


# --- CausalAttention module ----------------------------------------------


def test_module_has_qkv(solution):
    m = solution.CausalAttention(D_IN, D_OUT, CTX)
    assert isinstance(m.W_q, nn.Linear)
    assert m.W_q.bias is None


def test_module_registers_mask_as_buffer(solution):
    m = solution.CausalAttention(D_IN, D_OUT, CTX)
    buf_names = {name for name, _ in m.named_buffers()}
    assert "mask" in buf_names


def test_module_forward_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.CausalAttention(D_IN, D_OUT, CTX)
    out = m(x)
    assert out.shape == (B, T, D_OUT)


def test_module_handles_shorter_T(solution):
    """T < context_length must still work (mask sliced)."""
    torch.manual_seed(0)
    x = torch.randn(B, 2, D_IN)  # T=2 < CTX=4
    m = solution.CausalAttention(D_IN, D_OUT, CTX)
    out = m(x)
    assert out.shape == (B, 2, D_OUT)


def test_module_position_zero_equals_value_zero(solution):
    """Causal: position 0 only attends to key 0, so out[:,0,:] == V[:,0,:]."""
    torch.manual_seed(0)
    x = torch.randn(B, T, D_IN)
    m = solution.CausalAttention(D_IN, D_OUT, CTX)
    out = m(x)
    v = m.W_v(x)
    torch.testing.assert_close(out[:, 0, :], v[:, 0, :])
