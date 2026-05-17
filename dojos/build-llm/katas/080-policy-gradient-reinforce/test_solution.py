"""Tests for policy-gradient-reinforce."""

import torch


def test_returns_scalar_tensor(solution):
    logits = torch.zeros(4, requires_grad=True)
    loss = solution.pg_loss(logits, action=1, reward=1.0)
    assert isinstance(loss, torch.Tensor)
    assert loss.shape == ()


def test_gradient_direction_positive_reward(solution):
    """Positive reward on action `a` should push logits[a] UP after a
    minimizer step. With cross-entropy-like gradient: d loss / d logit[a]
    is negative when reward > 0 (so gradient descent increases it).
    """
    logits = torch.zeros(4, requires_grad=True)
    loss = solution.pg_loss(logits, action=2, reward=1.0)
    loss.backward()
    grad = logits.grad
    # Gradient on the chosen action must be negative (so descent moves up).
    assert grad[2] < 0
    # Gradients on the non-chosen actions must be positive (probability
    # mass for the chosen action increases, others decrease).
    for i in (0, 1, 3):
        assert grad[i] > 0


def test_gradient_direction_negative_reward(solution):
    """Negative reward flips every sign."""
    logits = torch.zeros(4, requires_grad=True)
    loss = solution.pg_loss(logits, action=2, reward=-1.0)
    loss.backward()
    grad = logits.grad
    assert grad[2] > 0
    for i in (0, 1, 3):
        assert grad[i] < 0


def test_zero_reward_zero_gradient(solution):
    """Reward of 0 should produce zero gradient — no learning signal."""
    logits = torch.zeros(4, requires_grad=True)
    loss = solution.pg_loss(logits, action=0, reward=0.0)
    loss.backward()
    assert torch.allclose(logits.grad, torch.zeros(4))


def test_loss_value_matches_negative_log_prob_times_reward(solution):
    """For uniform logits and reward=2.0, loss should equal -log(0.25)*2."""
    logits = torch.zeros(4, requires_grad=True)
    loss = solution.pg_loss(logits, action=1, reward=2.0)
    expected = -torch.log(torch.tensor(0.25)) * 2.0
    assert torch.allclose(loss, expected, atol=1e-5)
