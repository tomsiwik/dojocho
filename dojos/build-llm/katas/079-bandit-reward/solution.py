"""bandit-reward — a 4-arm Bernoulli bandit environment.

This is the toy environment we will train policies against in the
next five katas. Each arm has a fixed probability of returning a
reward of 1.0 (otherwise 0.0). The agent's only action is to pick
an arm; there is no observation / state.

The point of using a Bernoulli (0/1) reward instead of, say, a
Gaussian, is that it mirrors the RLVR setup from chapter 6: the
math verifier returns 1 for a correct answer and 0 otherwise.
"""

import torch

torch.manual_seed(0)

TRUE_REWARDS = ...  # implement me: [0.1, 0.4, 0.7, 0.3]


def sample_reward(arm: int) -> float:
    """Sample a Bernoulli reward for `arm`.

    Returns 1.0 with probability TRUE_REWARDS[arm], else 0.0.
    Must be a Python float (not a torch tensor).
    """
    ...  # implement me
