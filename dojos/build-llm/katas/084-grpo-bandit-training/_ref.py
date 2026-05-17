"""Reference solution for grpo-bandit-training."""

import torch

torch.manual_seed(0)

TRUE_REWARDS = [0.1, 0.4, 0.7, 0.3]


def sample_reward(arm: int) -> float:
    return 1.0 if torch.rand(()).item() < TRUE_REWARDS[arm] else 0.0


def train_grpo_bandit(
    steps: int = 300,
    group_size: int = 16,
    lr: float = 0.1,
) -> torch.Tensor:
    logits = torch.zeros(4, requires_grad=True)
    optimizer = torch.optim.SGD([logits], lr=lr)

    for _ in range(steps):
        probs = torch.softmax(logits, dim=-1)
        actions = torch.multinomial(
            probs.detach(), num_samples=group_size, replacement=True
        )
        rewards = torch.tensor(
            [sample_reward(int(a)) for a in actions], dtype=torch.float32
        )
        advantages = (rewards - rewards.mean()) / (
            rewards.std(unbiased=False) + 1e-8
        )

        log_probs = torch.log_softmax(logits, dim=-1)
        log_pi_actions = log_probs[actions]
        loss = -(advantages.detach() * log_pi_actions).mean()

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    return logits.detach()
