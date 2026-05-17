"""Tests for Inference vs Training Tradeoff."""

import random


class MockModel:
    """Stochastic adder.

    On call, returns the correct answer with probability `p`, otherwise
    a wrong-by-one answer. Uses a fixed `random.Random` so tests are
    deterministic.
    """

    def __init__(self, p: float = 0.6, lr: float = 0.01, seed: int = 0):
        self.p = p
        self.lr = lr
        self._rng = random.Random(seed)

    def __call__(self, prompt: str) -> str:
        # prompt is e.g. "2 + 3"; the "correct" answer is the sum.
        a, _, b = prompt.split()
        correct = str(int(a) + int(b))
        if self._rng.random() < self.p:
            return correct
        return str(int(correct) + 1)  # wrong-by-one


# ----- inference_scaling -----


def test_inference_scaling_returns_string(solution):
    m = MockModel(p=1.0)
    result = solution.inference_scaling(m, "2 + 3", n_samples=5)
    assert isinstance(result, str)


def test_inference_scaling_perfect_model(solution):
    """A 100% correct model trivially returns the right answer."""
    m = MockModel(p=1.0)
    assert solution.inference_scaling(m, "2 + 3", n_samples=3) == "5"


def test_inference_scaling_does_not_mutate(solution):
    """The function must not change model.p (it's inference-only)."""
    m = MockModel(p=0.6)
    p_before = m.p
    solution.inference_scaling(m, "1 + 1", n_samples=10)
    assert m.p == p_before


def test_inference_scaling_improves_noisy_model(solution):
    """With p=0.7 and 51 samples, majority vote nearly always wins.

    Compare single-sample accuracy vs voted accuracy across many trials.
    """
    n_trials = 200
    single_correct = 0
    voted_correct = 0
    for trial in range(n_trials):
        m_single = MockModel(p=0.7, seed=trial)
        m_voted = MockModel(p=0.7, seed=trial + 10_000)
        if m_single("3 + 4") == "7":
            single_correct += 1
        if solution.inference_scaling(m_voted, "3 + 4", n_samples=51) == "7":
            voted_correct += 1
    # Voted should crush single-shot on a noisy model.
    assert voted_correct > single_correct
    assert voted_correct >= int(0.95 * n_trials)


# ----- training_loss -----


def test_training_loss_returns_float(solution):
    m = MockModel(p=1.0)
    loss = solution.training_loss(m, [("1 + 1", "2"), ("2 + 2", "4")])
    assert isinstance(loss, float)
    assert 0.0 <= loss <= 1.0


def test_training_loss_perfect_model_zero(solution):
    m = MockModel(p=1.0)
    loss = solution.training_loss(m, [("1 + 1", "2"), ("2 + 2", "4")])
    assert loss == 0.0


def test_training_loss_terrible_model_one(solution):
    m = MockModel(p=0.0)
    loss = solution.training_loss(m, [("1 + 1", "2"), ("2 + 2", "4")])
    assert loss == 1.0


def test_training_loss_bumps_p(solution):
    """Each correct example should raise model.p by `lr`."""
    m = MockModel(p=0.5, lr=0.01, seed=42)
    p_before = m.p
    examples = [(f"{i} + {i}", str(2 * i)) for i in range(1, 21)]
    solution.training_loss(m, examples)
    # After 20 examples with mixed outcomes, p must have moved up.
    assert m.p > p_before


def test_training_loss_decreases_over_repeated_batches(solution):
    """Calling training_loss in a loop should drive loss down — that's
    the whole point of "training."
    """
    m = MockModel(p=0.5, lr=0.05, seed=7)
    examples = [(f"{i} + {i}", str(2 * i)) for i in range(1, 11)]
    losses = []
    for _ in range(30):
        losses.append(solution.training_loss(m, examples))
    # First few batches should average higher than last few.
    early = sum(losses[:5]) / 5
    late = sum(losses[-5:]) / 5
    assert late < early
