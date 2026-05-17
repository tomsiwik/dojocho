"""Tests for Attention: minGPT vs Raschka."""

import torch


B, T, D_IN, N_HEADS, CTX = 2, 4, 8, 2, 4


def _toy_batch() -> torch.Tensor:
    torch.manual_seed(0)
    return torch.randn(B, T, D_IN)


def test_same_function_returns_triple(solution):
    out = solution.same_function(D_IN, N_HEADS, CTX, _toy_batch())
    assert isinstance(out, tuple)
    assert len(out) == 3
    rasch, mingpt, diff = out
    assert isinstance(rasch, torch.Tensor)
    assert isinstance(mingpt, torch.Tensor)
    assert isinstance(diff, float)


def test_outputs_have_matching_shapes(solution):
    rasch, mingpt, _ = solution.same_function(
        D_IN, N_HEADS, CTX, _toy_batch()
    )
    assert rasch.shape == (B, T, D_IN)
    assert mingpt.shape == (B, T, D_IN)


def test_outputs_are_numerically_equal(solution):
    """With matched weights, eval mode, no dropout — equality is exact
    up to float tolerance."""
    rasch, mingpt, diff = solution.same_function(
        D_IN, N_HEADS, CTX, _toy_batch()
    )
    torch.testing.assert_close(rasch, mingpt, atol=1e-5, rtol=1e-5)
    assert diff < 1e-4


def test_outputs_nonzero(solution):
    """Sanity: we're not comparing two zero tensors."""
    rasch, _, _ = solution.same_function(D_IN, N_HEADS, CTX, _toy_batch())
    assert rasch.abs().max().item() > 0


def test_works_for_shorter_T(solution):
    """T < context_length still works (mask sliced)."""
    torch.manual_seed(7)
    batch = torch.randn(B, 2, D_IN)
    rasch, mingpt, _ = solution.same_function(D_IN, N_HEADS, CTX, batch)
    assert rasch.shape == (B, 2, D_IN)
    torch.testing.assert_close(rasch, mingpt, atol=1e-5, rtol=1e-5)


def test_different_input_gives_different_output(solution):
    """Just a sanity check that the function isn't constant."""
    rasch_a, _, _ = solution.same_function(D_IN, N_HEADS, CTX, _toy_batch())
    torch.manual_seed(42)
    other_batch = torch.randn(B, T, D_IN)
    rasch_b, _, _ = solution.same_function(D_IN, N_HEADS, CTX, other_batch)
    assert not torch.allclose(rasch_a, rasch_b)
