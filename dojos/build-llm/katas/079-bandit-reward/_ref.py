"""Reference solution for bandit-reward."""

import torch

torch.manual_seed(0)

TRUE_REWARDS = [0.1, 0.4, 0.7, 0.3]


def sample_reward(arm: int) -> float:
    p = TRUE_REWARDS[arm]
    return 1.0 if torch.rand(()).item() < p else 0.0
