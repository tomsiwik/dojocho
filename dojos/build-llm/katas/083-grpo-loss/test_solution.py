"""Tests for grpo-loss."""

import torch


def test_returns_scalar(solution):
    logits = torch.zeros(4)
    loss = solution.grpo_loss(
        logits_old=logits.clone(),
        logits_new=logits.clone().requires_grad_(True),
        action=0,
        advantage=torch.tensor(1.0),
        clip_eps=0.2,
    )
    assert loss.shape == ()


def test_ratio_one_when_policies_equal(solution):
    """When old == new, ratio == 1 and loss == -A * log_pi (REINFORCE)."""
    logits_old = torch.zeros(4)
    logits_new = torch.zeros(4, requires_grad=True)
    A = torch.tensor(1.0)
    loss = solution.grpo_loss(logits_old, logits_new, action=1,
                              advantage=A, clip_eps=0.2)
    # log pi = log(0.25); ratio = 1; -min(1*A, clip*A) = -A = -1
    assert torch.allclose(loss, torch.tensor(-1.0), atol=1e-5)


def test_gradient_only_flows_into_new_logits(solution):
    """logits_old must not receive gradient."""
    logits_old = torch.zeros(4, requires_grad=True)
    logits_new = torch.zeros(4, requires_grad=True)
    A = torch.tensor(1.0)
    loss = solution.grpo_loss(logits_old, logits_new, action=2,
                              advantage=A, clip_eps=0.2)
    loss.backward()
    assert logits_new.grad is not None
    # logits_old should have no gradient (or all-zero gradient).
    assert logits_old.grad is None or torch.allclose(
        logits_old.grad, torch.zeros(4)
    )


def test_advantage_is_detached(solution):
    """Gradient must NOT flow into `advantage`. This is the key contract."""
    logits_old = torch.zeros(4)
    logits_new = torch.zeros(4, requires_grad=True)
    A = torch.tensor(1.0, requires_grad=True)
    loss = solution.grpo_loss(logits_old, logits_new, action=0,
                              advantage=A, clip_eps=0.2)
    loss.backward()
    # If the impl detaches A, A.grad stays None.
    assert A.grad is None or torch.allclose(A.grad, torch.tensor(0.0))


def test_clip_active_when_ratio_too_high(solution):
    """When ratio >> 1 and A > 0, the clip caps the loss.

    Make logits_new strongly favor `action` so the ratio explodes
    upward. The clipped loss should equal -clipped_ratio * A.
    """
    logits_old = torch.zeros(4)
    logits_new = torch.tensor([0.0, 0.0, 10.0, 0.0], requires_grad=True)
    A = torch.tensor(1.0)
    eps = 0.2
    loss = solution.grpo_loss(logits_old, logits_new, action=2,
                              advantage=A, clip_eps=eps)
    # Expected when clip is active: loss = -(1 + eps) * A = -1.2
    assert torch.allclose(loss, torch.tensor(-(1.0 + eps)), atol=1e-4)


def test_clip_active_when_ratio_too_low_and_advantage_negative(solution):
    """When ratio < 1-eps and A < 0, the min() takes the clipped branch.

    With A < 0, the unclipped loss `-ratio*A = -ratio*(-|A|)` is positive
    and grows as ratio shrinks. The clip caps the loss at
    `-(1-eps)*A = (1-eps)*|A|`.
    """
    logits_old = torch.tensor([0.0, 0.0, 10.0, 0.0])
    logits_new = torch.zeros(4, requires_grad=True)
    A = torch.tensor(-1.0)
    eps = 0.2
    loss = solution.grpo_loss(logits_old, logits_new, action=2,
                              advantage=A, clip_eps=eps)
    # loss = -min(ratio*A, clipped*A). With A<0, ratio<1-eps:
    #   ratio*A = small_ratio * (-1) = -small_ratio (close to 0)
    #   clipped*A = (1-eps) * (-1) = -(1-eps) = -0.8
    # min picks -0.8 (more negative); loss = -(-0.8) = 0.8
    assert torch.allclose(loss, torch.tensor(1.0 - eps), atol=1e-4)


def test_zero_advantage_zero_loss(solution):
    logits_old = torch.zeros(4)
    logits_new = torch.randn(4, requires_grad=True)
    A = torch.tensor(0.0)
    loss = solution.grpo_loss(logits_old, logits_new, action=1,
                              advantage=A, clip_eps=0.2)
    assert torch.allclose(loss, torch.tensor(0.0), atol=1e-6)
