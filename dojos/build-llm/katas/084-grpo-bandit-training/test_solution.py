"""Tests for grpo-bandit-training."""

import torch


def test_returns_4d_tensor(solution):
    torch.manual_seed(0)
    logits = solution.train_grpo_bandit(steps=10, group_size=8, lr=0.1)
    assert isinstance(logits, torch.Tensor)
    assert logits.shape == (4,)


def test_policy_concentrates_on_arm_2(solution):
    """After training, arm 2 (p=0.7) should have the highest probability."""
    torch.manual_seed(0)
    logits = solution.train_grpo_bandit(steps=300, group_size=16, lr=0.1)
    probs = torch.softmax(logits, dim=-1)
    best = int(torch.argmax(probs).item())
    assert best == 2, (
        f"expected arm 2 to win; got arm {best} with probs={probs.tolist()}"
    )


def test_policy_probability_substantial(solution):
    """Arm 2's probability should be well above uniform (0.25)."""
    torch.manual_seed(0)
    logits = solution.train_grpo_bandit(steps=300, group_size=16, lr=0.1)
    probs = torch.softmax(logits, dim=-1)
    assert probs[2].item() > 0.4, (
        f"arm 2 prob should be >0.4 after training; got {probs.tolist()}"
    )


def test_true_rewards_unchanged(solution):
    """Sanity check: the env constants weren't touched during training."""
    torch.manual_seed(0)
    _ = solution.train_grpo_bandit(steps=20, group_size=8, lr=0.1)
    assert list(solution.TRUE_REWARDS) == [0.1, 0.4, 0.7, 0.3]
