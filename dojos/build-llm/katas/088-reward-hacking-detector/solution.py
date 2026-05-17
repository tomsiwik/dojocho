"""reward-hacking-detector

Detect reward hacking from training history alone. The signature is
classic: training reward keeps going up while held-out task accuracy
goes down — the model is learning to game the reward signal at the
expense of the thing you actually care about.

You return the *first* iteration index where this divergence exceeds
a threshold, or `-1` if it never does. The check is built on
smoothed reward and held-out trends so a single noisy step doesn't
fire a false alarm.
"""


def detect_reward_hacking(
    train_history: list[dict],
    window: int = 5,
    threshold: float = 0.05,
) -> int:
    """Find the first iteration where smoothed reward trend rises while
    smoothed held-out trend falls by more than `threshold` in total
    over the trailing `window`.

    Each entry of `train_history` is a dict with keys:
        - 'reward': float, training reward at that step
        - 'held_out_metric': float, held-out / eval accuracy at that step

    Args:
        train_history: list ordered by training step.
        window: number of steps used for the trailing trend.
        threshold: minimum absolute gap (reward_delta - held_out_delta)
            over the window to count as hacking.

    Returns:
        The index `i` (i >= window) where the divergence first exceeds
        the threshold. Returns -1 if no such index exists.

    Definition of "divergence at index i":
        reward_delta_i   = reward[i]         - reward[i - window]
        held_out_delta_i = held_out[i]       - held_out[i - window]
        divergence_i     = reward_delta_i - held_out_delta_i
        Trigger when reward_delta_i > 0 AND held_out_delta_i < 0
                 AND divergence_i > threshold.
    """
    ...  # implement me
