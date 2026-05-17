"""Tests for adaptive-kl-coefficient."""


def test_high_kl_increases_beta(solution):
    """observed_kl > 2*target → beta should grow."""
    new_beta = solution.update_beta(beta=0.1, kl=1.0, target_kl=0.1)
    assert new_beta > 0.1


def test_low_kl_decreases_beta(solution):
    """observed_kl < 0.5*target → beta should shrink."""
    new_beta = solution.update_beta(beta=0.1, kl=0.01, target_kl=0.1)
    assert new_beta < 0.1


def test_in_band_kl_leaves_beta_unchanged(solution):
    """0.5*target <= kl <= 2*target → beta stays put."""
    new_beta = solution.update_beta(beta=0.1, kl=0.1, target_kl=0.1)
    assert new_beta == 0.1
    new_beta = solution.update_beta(beta=0.1, kl=0.15, target_kl=0.1)
    assert new_beta == 0.1
    new_beta = solution.update_beta(beta=0.1, kl=0.06, target_kl=0.1)
    assert new_beta == 0.1


def test_beta_stays_positive(solution):
    """Many decreases must not drive beta to zero or below."""
    beta = 1.0
    for _ in range(100):
        beta = solution.update_beta(beta, kl=0.0, target_kl=1.0, lr=0.5)
    assert beta > 0


def test_lr_controls_step_size(solution):
    """Larger lr → larger jump per update."""
    small = solution.update_beta(beta=0.1, kl=10.0, target_kl=0.1, lr=0.1)
    big = solution.update_beta(beta=0.1, kl=10.0, target_kl=0.1, lr=0.9)
    assert big > small > 0.1


def test_controller_drives_kl_toward_target(solution):
    """Simulate: a higher beta should suppress observed KL.

    Toy model: observed_kl = base_kl / beta. Run the controller for a
    few iterations and check observed_kl ends up near target.
    """
    target = 0.1
    beta = 0.01
    base_kl = 1.0  # arbitrary "natural" KL the unconstrained policy would produce

    for _ in range(50):
        kl = base_kl / beta  # higher beta → smaller observed KL
        beta = solution.update_beta(beta, kl=kl, target_kl=target, lr=0.5)

    final_kl = base_kl / beta
    # Should be within the controller's deadband (0.5*target, 2*target).
    assert 0.5 * target <= final_kl <= 2.0 * target, f"final_kl={final_kl}, beta={beta}"


def test_returns_float(solution):
    out = solution.update_beta(beta=0.1, kl=0.1, target_kl=0.1)
    assert isinstance(out, float)
