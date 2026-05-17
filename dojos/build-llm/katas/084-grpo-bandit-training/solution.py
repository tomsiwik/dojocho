"""grpo-bandit-training — end-to-end RLVR loop on a 4-arm bandit.

Train a softmax policy over 4 arms using GRPO. After ~300 SGD
steps with group_size>=8, the policy should concentrate on
arm 2 (true reward = 0.7, the best one).

Mirrors chapter 6's compute_grpo_loss / train_rlvr_grpo at a
scale you can run in well under a second.
"""

import torch

torch.manual_seed(0)

TRUE_REWARDS = [0.1, 0.4, 0.7, 0.3]


def sample_reward(arm: int) -> float:
    """Bernoulli reward for the given arm."""
    return 1.0 if torch.rand(()).item() < TRUE_REWARDS[arm] else 0.0


def train_grpo_bandit(
    steps: int = 300,
    group_size: int = 16,
    lr: float = 0.1,
) -> torch.Tensor:
    """Train a 4-arm softmax policy with GRPO.

    Returns the final (detached) logits tensor of shape (4,).
    The softmax of these logits should put most mass on arm 2.
    """
    ...  # implement me
