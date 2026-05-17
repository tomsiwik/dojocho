"""policy-gradient-reinforce — the REINFORCE loss for a softmax policy.

Given logits over 4 arms (a parameter vector we will learn) and a
single sampled (action, reward) pair from the bandit, return a
scalar loss whose gradient is the REINFORCE policy gradient:

    loss = - log pi(action) * reward

When PyTorch minimizes this loss, the policy moves to assign higher
probability to actions that achieved higher reward.

This is exactly the form that appears inside GRPO (chapter 6,
section 6.9), except GRPO uses an `advantage` instead of the raw
reward and sums log-probs over generated tokens.
"""

import torch


def pg_loss(logits: torch.Tensor, action: int, reward: float) -> torch.Tensor:
    """REINFORCE loss for one (action, reward) sample.

    Args:
        logits: 1D tensor of shape (n_actions,), requires_grad=True.
        action: index of the action that was taken.
        reward: scalar reward observed for that action.

    Returns:
        Scalar tensor; calling .backward() on it produces the
        REINFORCE gradient w.r.t. logits.
    """
    ...  # implement me
