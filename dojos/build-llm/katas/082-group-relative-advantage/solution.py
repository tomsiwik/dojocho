"""group-relative-advantage — the 'GR' in GRPO.

For each prompt, GRPO samples N rollouts and scores each. Rather
than comparing rewards across the whole batch (which would mix
prompt difficulty into the signal), GRPO normalizes rewards
WITHIN EACH GROUP of N rollouts:

    A_i = (r_i - mean(group)) / (std(group) + eps)

This is the trick that lets GRPO skip the value network PPO
needs. The "baseline" is just the group mean.
"""


def group_relative_advantage(
    rewards: list[float], group_size: int
) -> list[float]:
    """Z-score `rewards` within consecutive groups of `group_size`.

    Args:
        rewards: flat list of rewards. `len(rewards)` is assumed to
            be a multiple of `group_size`.
        group_size: number of rollouts per prompt-group.

    Returns:
        Flat list of advantages, same length and order as `rewards`.
        When all rewards in a group are equal (or group_size == 1),
        every advantage in that group is 0.0.
    """
    ...  # implement me
