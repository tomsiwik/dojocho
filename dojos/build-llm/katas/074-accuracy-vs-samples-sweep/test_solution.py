"""Tests for accuracy-vs-samples-sweep."""

import random


def make_per_problem_llm(answers: dict[str, str], distractors: list[str], correct_rate: float, seed: int):
    """Mock LLM: per prompt, return `answers[prompt]` with `correct_rate`
    probability, else a random distractor."""
    rng = random.Random(seed)

    def mock_llm(prompt: str, n_samples: int) -> list[str]:
        correct = answers[prompt]
        out = []
        for _ in range(n_samples):
            if rng.random() < correct_rate:
                out.append(correct)
            else:
                out.append(rng.choice(distractors))
        return out

    return mock_llm


def test_returns_list_of_floats_with_right_length(solution):
    mock = lambda prompt, n: ["x"] * n
    problems = [("p1", "x"), ("p2", "x")]
    result = solution.accuracy_sweep(mock, problems, max_n=5)
    assert isinstance(result, list)
    assert len(result) == 5
    assert all(isinstance(a, float) for a in result)


def test_max_n_zero_returns_empty(solution):
    mock = lambda prompt, n: ["x"] * n
    assert solution.accuracy_sweep(mock, [("p", "x")], max_n=0) == []


def test_empty_problems_returns_zeros(solution):
    mock = lambda prompt, n: ["x"] * n
    result = solution.accuracy_sweep(mock, [], max_n=3)
    assert result == [0.0, 0.0, 0.0]


def test_perfect_model_perfect_accuracy(solution):
    # The mock always returns the correct answer. Every N should be 1.0.
    problems = [("p1", "a"), ("p2", "b"), ("p3", "c")]
    answers = dict(problems)
    def mock(prompt, n):
        return [answers[prompt]] * n
    result = solution.accuracy_sweep(mock, problems, max_n=5)
    assert result == [1.0, 1.0, 1.0, 1.0, 1.0]


def test_monotone_non_decreasing_with_majority(solution):
    """The whole pedagogical point: with majority voting on a
    mostly-correct sampler, accuracy at higher N should be >= accuracy
    at lower N (over enough problems and samples)."""
    n_problems = 40
    problems = [(f"p{i}", "right") for i in range(n_problems)]
    answers = dict(problems)
    mock = make_per_problem_llm(answers, ["wrong1", "wrong2", "wrong3"], correct_rate=0.6, seed=42)

    # Use odd N to avoid tie-break artifacts dominating.
    result = solution.accuracy_sweep(mock, problems, max_n=11)

    # Accuracy at the largest N must be at least accuracy at N=1.
    assert result[-1] >= result[0]
    # And it should be substantially higher (voting works).
    assert result[-1] > result[0] + 0.1


def test_levels_off_at_high_n(solution):
    """At high N, additional samples shouldn't dramatically change
    accuracy — the curve should plateau."""
    n_problems = 50
    problems = [(f"p{i}", "right") for i in range(n_problems)]
    answers = dict(problems)
    mock = make_per_problem_llm(answers, ["wrong"], correct_rate=0.7, seed=7)

    result = solution.accuracy_sweep(mock, problems, max_n=15)
    # The last few accuracies should be within a small band of each other.
    tail = result[-5:]
    assert max(tail) - min(tail) < 0.15


def test_accuracy_at_n1_is_single_shot_rate(solution):
    """At N=1, majority-vote is just "use the one sample" — accuracy
    should approximately equal the per-sample correct rate."""
    n_problems = 200
    problems = [(f"p{i}", "right") for i in range(n_problems)]
    answers = dict(problems)
    correct_rate = 0.6
    mock = make_per_problem_llm(answers, ["wrong"], correct_rate=correct_rate, seed=123)

    result = solution.accuracy_sweep(mock, problems, max_n=1)
    # Expect roughly correct_rate, within sampling noise (~ +/- 0.1).
    assert abs(result[0] - correct_rate) < 0.1


def test_accuracy_in_unit_interval(solution):
    mock = lambda prompt, n: ["x" if i % 2 == 0 else "y" for i in range(n)]
    problems = [("p", "x")]
    result = solution.accuracy_sweep(mock, problems, max_n=5)
    assert all(0.0 <= a <= 1.0 for a in result)
