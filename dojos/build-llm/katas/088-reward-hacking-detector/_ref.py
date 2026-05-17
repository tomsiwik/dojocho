"""Reference solution for reward-hacking-detector."""


def detect_reward_hacking(
    train_history: list[dict],
    window: int = 5,
    threshold: float = 0.05,
) -> int:
    rewards = [h["reward"] for h in train_history]
    held = [h["held_out_metric"] for h in train_history]

    for i in range(window, len(train_history)):
        reward_delta = rewards[i] - rewards[i - window]
        held_delta = held[i] - held[i - window]
        divergence = reward_delta - held_delta
        if reward_delta > 0 and held_delta < 0 and divergence > threshold:
            return int(i)
    return -1
