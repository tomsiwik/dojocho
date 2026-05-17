"""Tests for kl-penalized-grpo."""

import torch


def _fixed_inputs():
    new_logps = torch.tensor([-7.9243, -20.1546, -16.6130, -23.3677], requires_grad=True)
    ref_logps = torch.tensor([-10.9243, -20.3546, -14.6130, -23.3677])
    rewards = torch.tensor([1.0, 1.0, 0.0, 0.0])
    return new_logps, ref_logps, rewards


def test_grpo_loss_matches_reference(solution):
    """Compare against Raschka ch07's worked example (-2.5764)."""
    new_logps, _, rewards = _fixed_inputs()
    loss = solution.grpo_loss(new_logps, rewards)
    assert abs(loss.item() - (-2.5764)) < 1e-3, loss.item()


def test_beta_zero_equals_plain_grpo(solution):
    """With beta=0, the combined loss must equal grpo_loss alone."""
    new_logps, ref_logps, rewards = _fixed_inputs()
    combined = solution.kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta=0.0)
    plain = solution.grpo_loss(new_logps, rewards)
    assert torch.allclose(combined, plain, atol=1e-6), f"{combined.item()} vs {plain.item()}"


def test_kl_penalty_zero_when_equal(solution):
    """If new_logps == ref_logps, KL term must be 0."""
    logps = torch.tensor([-1.0, -2.0, -3.0, -4.0])
    kl = solution.kl_penalty(logps, logps)
    assert torch.allclose(kl, torch.tensor(0.0), atol=1e-6)


def test_kl_penalty_sign(solution):
    """new_logps > ref_logps → positive KL estimate (policy moved up)."""
    new_logps = torch.tensor([-1.0, -1.0, -1.0])
    ref_logps = torch.tensor([-3.0, -3.0, -3.0])
    kl = solution.kl_penalty(new_logps, ref_logps)
    assert kl.item() > 0


def test_high_beta_keeps_policy_near_reference(solution):
    """With large beta, optimizing the loss should push new_logps toward ref_logps.

    Differentiate the loss w.r.t. new_logps once: if beta dominates,
    the gradient should drive new_logps DOWN when it is above ref_logps
    (and vice versa), since `kl_penalty = mean(new_logps - ref_logps)`.
    """
    new_logps = torch.tensor([-1.0, -1.0, -1.0, -1.0], requires_grad=True)
    ref_logps = torch.tensor([-5.0, -5.0, -5.0, -5.0])  # ref much lower
    rewards = torch.tensor([1.0, 1.0, 0.0, 0.0])

    # Take one gradient step with very high beta.
    loss = solution.kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta=100.0)
    loss.backward()
    grad = new_logps.grad
    # With beta dominating and new > ref, gradient must be positive
    # (so a descent step *lowers* new_logps toward ref_logps).
    assert (grad > 0).all(), f"grad={grad}"


def test_low_beta_dominated_by_grpo(solution):
    """With tiny beta, loss is essentially plain GRPO."""
    new_logps, ref_logps, rewards = _fixed_inputs()
    combined = solution.kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta=1e-8)
    plain = solution.grpo_loss(new_logps, rewards)
    assert torch.allclose(combined, plain, atol=1e-4)


def test_loss_is_differentiable(solution):
    new_logps, ref_logps, rewards = _fixed_inputs()
    loss = solution.kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta=0.02)
    loss.backward()
    assert new_logps.grad is not None
    assert new_logps.grad.shape == new_logps.shape


def test_returns_scalar(solution):
    new_logps, ref_logps, rewards = _fixed_inputs()
    out = solution.kl_penalized_grpo_loss(new_logps, ref_logps, rewards, beta=0.01)
    assert out.dim() == 0
