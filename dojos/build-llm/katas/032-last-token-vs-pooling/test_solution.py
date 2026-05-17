"""Tests for Last Token vs Pooling."""

import pytest
import torch
import torch.nn as nn


# --- last_token_pool --------------------------------------------------------

def test_last_token_pool_shape(solution):
    x = torch.randn(4, 7, 16)
    out = solution.last_token_pool(x)
    assert out.shape == (4, 16)


def test_last_token_pool_uses_last_column(solution):
    """It must return the last time step exactly, byte-for-byte."""
    x = torch.randn(3, 5, 8)
    out = solution.last_token_pool(x)
    assert torch.equal(out, x[:, -1, :])


def test_last_token_pool_ignores_earlier_tokens(solution):
    """Mutating earlier tokens must not affect the output."""
    x = torch.randn(2, 6, 4)
    out1 = solution.last_token_pool(x).clone()
    x[:, :-1, :] = 0.0  # zero everything except last
    out2 = solution.last_token_pool(x)
    assert torch.equal(out1, out2)


# --- mean_pool --------------------------------------------------------------

def test_mean_pool_no_mask(solution):
    x = torch.randn(3, 5, 8)
    out = solution.mean_pool(x)
    assert out.shape == (3, 8)
    assert torch.allclose(out, x.mean(dim=1))


def test_mean_pool_with_mask(solution):
    """With mask=[1,1,1,0,0], pool should ignore the last two positions."""
    x = torch.randn(2, 5, 4)
    mask = torch.tensor([[1, 1, 1, 0, 0], [1, 1, 1, 1, 0]], dtype=torch.float)
    out = solution.mean_pool(x, mask=mask)
    # Expected: mean over only the 1-positions.
    expected_0 = x[0, :3, :].mean(dim=0)
    expected_1 = x[1, :4, :].mean(dim=0)
    assert torch.allclose(out[0], expected_0, atol=1e-6)
    assert torch.allclose(out[1], expected_1, atol=1e-6)


def test_mean_pool_mask_differs_from_unmasked(solution):
    """Mask should change the result when there's padding."""
    x = torch.randn(1, 5, 4)
    # Make the padded positions extreme so they obviously skew the unmasked mean.
    x[:, 3:, :] = 100.0
    mask = torch.tensor([[1, 1, 1, 0, 0]], dtype=torch.float)
    out_masked = solution.mean_pool(x, mask=mask)
    out_unmasked = solution.mean_pool(x)
    assert not torch.allclose(out_masked, out_unmasked)


# --- AttentionPool ----------------------------------------------------------

def test_attention_pool_shape(solution):
    pool = solution.AttentionPool(d_model=16)
    x = torch.randn(4, 7, 16)
    out = pool(x)
    assert out.shape == (4, 16)


def test_attention_pool_has_learnable_query(solution):
    pool = solution.AttentionPool(d_model=16)
    # Must have a parameter of shape (16,) — the query vector.
    params = list(pool.parameters())
    assert any(p.shape == (16,) for p in params), \
        f"Expected a Parameter of shape (16,), got shapes {[tuple(p.shape) for p in params]}"


def test_attention_pool_weights_sum_to_one(solution):
    """Implicitly: softmax-normalized weights over T."""
    pool = solution.AttentionPool(d_model=8)
    # If all token vectors are the same, weights are uniform 1/T → pool == that vector.
    x = torch.ones(2, 5, 8) * 3.0
    out = pool(x)
    # sum_t (1/T) * 3 = 3, regardless of query.
    expected = torch.ones(2, 8) * 3.0
    assert torch.allclose(out, expected, atol=1e-5)


def test_attention_pool_is_differentiable(solution):
    """Gradient flows to the learned query."""
    pool = solution.AttentionPool(d_model=8)
    x = torch.randn(2, 4, 8)
    out = pool(x)
    out.sum().backward()
    # Find the query parameter and check it has a gradient.
    query_param = next(p for p in pool.parameters() if p.shape == (8,))
    assert query_param.grad is not None
    assert query_param.grad.shape == (8,)


# --- All three return same shape -------------------------------------------

def test_all_three_poolers_same_output_shape(solution):
    x = torch.randn(3, 6, 12)
    a = solution.last_token_pool(x)
    b = solution.mean_pool(x)
    c = solution.AttentionPool(d_model=12)(x)
    assert a.shape == b.shape == c.shape == (3, 12)
