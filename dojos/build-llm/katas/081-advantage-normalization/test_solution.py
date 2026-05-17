"""Tests for advantage-normalization."""

import pytest
import torch


def test_raw_returns_input_unchanged(solution):
    r = torch.tensor([1.0, 0.0, 1.0, 0.0])
    adv = solution.compute_advantages(r, mode="raw")
    assert torch.allclose(adv, r)


def test_mean_centered_has_zero_mean(solution):
    r = torch.tensor([1.0, 0.0, 1.0, 0.0])
    adv = solution.compute_advantages(r, mode="mean_centered")
    assert torch.allclose(adv.mean(), torch.tensor(0.0), atol=1e-6)


def test_mean_centered_value(solution):
    r = torch.tensor([2.0, 4.0, 6.0])  # mean = 4
    adv = solution.compute_advantages(r, mode="mean_centered")
    assert torch.allclose(adv, torch.tensor([-2.0, 0.0, 2.0]))


def test_mean_std_normalized_has_zero_mean(solution):
    r = torch.tensor([1.0, 0.0, 1.0, 0.0])
    adv = solution.compute_advantages(r, mode="mean_std_normalized")
    assert torch.allclose(adv.mean(), torch.tensor(0.0), atol=1e-5)


def test_mean_std_normalized_has_unit_std(solution):
    r = torch.tensor([1.0, 0.0, 1.0, 0.0])
    adv = solution.compute_advantages(r, mode="mean_std_normalized")
    # epsilon makes it slightly less than 1, but very close.
    assert abs(adv.std(unbiased=False).item() - 1.0) < 1e-3


def test_mean_std_normalized_uniform_rewards_safe(solution):
    """When all rewards are equal, std=0; epsilon must prevent NaN."""
    r = torch.tensor([0.5, 0.5, 0.5, 0.5])
    adv = solution.compute_advantages(r, mode="mean_std_normalized")
    assert not torch.isnan(adv).any()
    assert torch.allclose(adv, torch.zeros(4), atol=1e-3)


def test_unknown_mode_raises(solution):
    r = torch.tensor([1.0, 0.0])
    with pytest.raises(ValueError):
        solution.compute_advantages(r, mode="nope")


def test_does_not_mutate_input(solution):
    r = torch.tensor([1.0, 2.0, 3.0])
    original = r.clone()
    _ = solution.compute_advantages(r, mode="mean_centered")
    assert torch.allclose(r, original)
