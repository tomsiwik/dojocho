"""Tests for reward-hacking-detector."""


def _history(rewards, held_out):
    assert len(rewards) == len(held_out)
    return [
        {"reward": r, "held_out_metric": h}
        for r, h in zip(rewards, held_out)
    ]


def test_healthy_training_returns_minus_one(solution):
    """Both metrics rising in lockstep → no hacking, returns -1."""
    rewards = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    held_out = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    hist = _history(rewards, held_out)
    assert solution.detect_reward_hacking(hist, window=3, threshold=0.05) == -1


def test_hacking_detected_when_divergence_exceeds_threshold(solution):
    """Reward rises while held-out falls → flag the first qualifying step."""
    # Healthy for 5 steps, then reward keeps climbing but held-out crashes.
    rewards = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    held_out = [0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]
    hist = _history(rewards, held_out)
    idx = solution.detect_reward_hacking(hist, window=3, threshold=0.1)
    # Window 3, threshold 0.1.
    # idx=6: reward_delta = 0.7-0.4 = 0.3; held_out_delta = 0.3-0.4 = -0.1;
    #   divergence = 0.4 > 0.1 ✓
    # idx=5 (the earliest possible after the turnaround): reward_delta = 0.6-0.3 = 0.3;
    #   held_out_delta = 0.4-0.4 = 0.0; held_out_delta < 0 is False → no trigger.
    assert idx == 6, f"expected first hacking idx 6, got {idx}"


def test_below_threshold_does_not_trigger(solution):
    """If divergence is small, return -1 even if directions disagree."""
    rewards = [0.5] * 5 + [0.51, 0.52, 0.53, 0.54, 0.55]
    held_out = [0.5] * 5 + [0.49, 0.48, 0.47, 0.46, 0.45]
    hist = _history(rewards, held_out)
    idx = solution.detect_reward_hacking(hist, window=3, threshold=0.5)
    assert idx == -1


def test_needs_both_signs_to_trigger(solution):
    """If held_out is flat (not falling), it's not hacking — just plateau."""
    rewards = [0.1, 0.2, 0.3, 0.5, 0.7, 0.9]
    held_out = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3]
    hist = _history(rewards, held_out)
    # Reward grows, held_out is flat (delta == 0, not < 0) → not hacking.
    assert solution.detect_reward_hacking(hist, window=3, threshold=0.1) == -1


def test_early_history_below_window_does_not_trigger(solution):
    """Indices before `window` cannot trigger."""
    rewards = [0.1, 0.9]
    held_out = [0.5, 0.0]
    hist = _history(rewards, held_out)
    # Only one possible index >= window=3 ... but len(hist) is 2.
    assert solution.detect_reward_hacking(hist, window=3, threshold=0.1) == -1


def test_returns_first_qualifying_index(solution):
    """If multiple indices qualify, return the earliest one."""
    rewards = [0.0, 0.0, 0.0, 0.5, 1.0, 1.5, 2.0]
    held_out = [1.0, 1.0, 1.0, 0.8, 0.4, 0.2, 0.0]
    hist = _history(rewards, held_out)
    # window=3, threshold=0.5
    # idx=3: reward_delta=0.5, held_delta=-0.2, div=0.7 > 0.5 → trigger.
    assert solution.detect_reward_hacking(hist, window=3, threshold=0.5) == 3


def test_window_parameter_changes_sensitivity(solution):
    """A larger window smooths out short-lived dips and may not trigger."""
    rewards = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
    held_out = [0.5, 0.5, 0.5, 0.5, 0.4, 0.5, 0.5]  # one-step dip
    hist = _history(rewards, held_out)
    # window=1 would catch the single-step dip at idx=4.
    # window=3: idx=4 → reward_delta=0.4-0.1=0.3, held_delta=0.4-0.5=-0.1,
    #   div=0.4 > 0.2 → would trigger.
    # window=5: idx=5 → reward_delta=0.6-0.1=0.5, held_delta=0.5-0.5=0.0 → no trigger.
    short = solution.detect_reward_hacking(hist, window=3, threshold=0.2)
    long = solution.detect_reward_hacking(hist, window=5, threshold=0.2)
    assert short != -1
    assert long == -1


def test_returns_int(solution):
    hist = _history([0.1, 0.2, 0.3, 0.4], [0.1, 0.2, 0.3, 0.4])
    out = solution.detect_reward_hacking(hist, window=2, threshold=0.1)
    assert isinstance(out, int)
