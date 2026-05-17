"""Tests for group-relative-advantage."""


def test_basic_two_groups_of_four(solution):
    # Group 1: [1, 1, 0, 0] -> mean 0.5, std 0.5 -> +1, +1, -1, -1
    # Group 2: [0, 0, 1, 1] -> same magnitudes
    rewards = [1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0]
    adv = solution.group_relative_advantage(rewards, group_size=4)
    assert len(adv) == 8
    # Each group sums to zero (mean-zero property).
    assert abs(sum(adv[:4])) < 1e-4
    assert abs(sum(adv[4:])) < 1e-4
    # Signs match: group 1 positives are first two, group 2 positives last two.
    assert adv[0] > 0 and adv[1] > 0
    assert adv[2] < 0 and adv[3] < 0
    assert adv[4] < 0 and adv[5] < 0
    assert adv[6] > 0 and adv[7] > 0


def test_uniform_group_yields_zero(solution):
    """When every rollout in a group gets the same reward, advantages are 0."""
    rewards = [1.0, 1.0, 1.0, 1.0]
    adv = solution.group_relative_advantage(rewards, group_size=4)
    assert all(abs(a) < 1e-3 for a in adv)


def test_uniform_group_zero_rewards(solution):
    """Same applies when all rewards are 0."""
    rewards = [0.0, 0.0, 0.0, 0.0]
    adv = solution.group_relative_advantage(rewards, group_size=4)
    assert all(abs(a) < 1e-3 for a in adv)


def test_single_element_groups(solution):
    """group_size=1: no relative comparison possible; all advantages are 0."""
    rewards = [0.0, 1.0, 0.5, 0.7]
    adv = solution.group_relative_advantage(rewards, group_size=1)
    assert len(adv) == 4
    assert all(abs(a) < 1e-3 for a in adv)


def test_per_group_not_per_batch(solution):
    """The whole point of the kata: groups don't leak into each other.

    Group A is all 1s; group B is all 0s. If we normalized across the
    whole batch, A would be strongly positive and B strongly negative.
    Per-group, each is uniform -> all zeros.
    """
    rewards = [1.0, 1.0, 0.0, 0.0]
    adv = solution.group_relative_advantage(rewards, group_size=2)
    assert all(abs(a) < 1e-3 for a in adv)


def test_returns_list_of_floats(solution):
    rewards = [1.0, 0.0]
    adv = solution.group_relative_advantage(rewards, group_size=2)
    assert isinstance(adv, list)
    for a in adv:
        assert isinstance(a, float)
