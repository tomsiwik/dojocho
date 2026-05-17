"""Tests for bandit-reward."""

import torch


def test_true_rewards_exposed(solution):
    assert list(solution.TRUE_REWARDS) == [0.1, 0.4, 0.7, 0.3]


def test_sample_reward_returns_float(solution):
    r = solution.sample_reward(0)
    assert isinstance(r, float)
    assert r in (0.0, 1.0)


def test_sample_reward_bernoulli(solution):
    """Empirical mean over 1000 samples is close to the true reward."""
    torch.manual_seed(0)
    for arm, p in enumerate(solution.TRUE_REWARDS):
        samples = [solution.sample_reward(arm) for _ in range(1000)]
        mean = sum(samples) / len(samples)
        # 3 standard errors for Bernoulli is ~3 * sqrt(p*(1-p)/1000) ~ 0.05.
        assert abs(mean - p) < 0.07, (
            f"arm {arm}: empirical mean {mean:.3f} vs true {p:.3f}"
        )


def test_sample_reward_uses_correct_arm(solution):
    """Arm 2 (p=0.7) should win against arm 0 (p=0.1) over many samples."""
    torch.manual_seed(0)
    best = sum(solution.sample_reward(2) for _ in range(500))
    worst = sum(solution.sample_reward(0) for _ in range(500))
    assert best > worst
