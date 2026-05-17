"""Tests for kv-cache-attention."""

import pytest
import torch


B, T, D_MODEL = 1, 6, 16


@pytest.fixture
def attn(solution):
    torch.manual_seed(0)
    m = solution.KVCacheAttention(D_MODEL)
    m.eval()
    return m


# --- one-shot (no cache) -------------------------------------------------


def test_no_cache_output_shape(solution, attn):
    x = torch.randn(B, T, D_MODEL)
    out, cache = attn(x, kv_cache=None)
    assert out.shape == (B, T, D_MODEL)


def test_no_cache_returns_cache(solution, attn):
    """First call must return a (K, V) tuple so the caller can cache it."""
    x = torch.randn(B, T, D_MODEL)
    out, cache = attn(x, kv_cache=None)
    assert isinstance(cache, tuple) and len(cache) == 2
    K, V = cache
    assert K.shape == (B, T, D_MODEL)
    assert V.shape == (B, T, D_MODEL)


# --- incremental (with cache) --------------------------------------------


def test_cache_appends(solution, attn):
    """After feeding 4 tokens then 1 more, the cache should hold 5."""
    x_prompt = torch.randn(B, 4, D_MODEL)
    x_next = torch.randn(B, 1, D_MODEL)
    with torch.inference_mode():
        _, cache = attn(x_prompt, kv_cache=None)
        _, cache2 = attn(x_next, kv_cache=cache)
    K, V = cache2
    assert K.shape == (B, 5, D_MODEL)
    assert V.shape == (B, 5, D_MODEL)


def test_incremental_matches_full(solution, attn):
    """The headline test: feeding tokens one at a time with the cache
    must give the same output as feeding the whole sequence at once."""
    torch.manual_seed(42)
    x_full = torch.randn(B, T, D_MODEL)

    with torch.inference_mode():
        # One-shot forward.
        out_full, _ = attn(x_full, kv_cache=None)

        # Incremental: feed one token at a time, passing cache forward.
        cache = None
        outs = []
        for t in range(T):
            x_t = x_full[:, t:t + 1, :]
            out_t, cache = attn(x_t, kv_cache=cache)
            outs.append(out_t)
        out_inc = torch.cat(outs, dim=1)

    torch.testing.assert_close(out_inc, out_full, atol=1e-5, rtol=1e-5)


def test_prefill_then_one_token(solution, attn):
    """Realistic chatbot pattern: prefill the prompt, then generate
    one token. Combined result must equal one-shot over the full
    sequence."""
    torch.manual_seed(7)
    x_full = torch.randn(B, T, D_MODEL)
    x_prompt = x_full[:, :T - 1, :]
    x_new = x_full[:, T - 1:, :]

    with torch.inference_mode():
        out_full, _ = attn(x_full, kv_cache=None)

        out_pre, cache = attn(x_prompt, kv_cache=None)
        out_new, cache2 = attn(x_new, kv_cache=cache)
        out_combined = torch.cat([out_pre, out_new], dim=1)

    torch.testing.assert_close(out_combined, out_full, atol=1e-5, rtol=1e-5)


def test_cache_grows_correctly_across_many_steps(solution, attn):
    """After N incremental calls of 1 token each, cache has exactly
    N entries."""
    with torch.inference_mode():
        cache = None
        for step in range(1, 6):
            x = torch.randn(B, 1, D_MODEL)
            _, cache = attn(x, kv_cache=cache)
            K, V = cache
            assert K.shape == (B, step, D_MODEL), f"step {step}: K wrong"
            assert V.shape == (B, step, D_MODEL), f"step {step}: V wrong"
