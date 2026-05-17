"""Tests for self-consistency-end-to-end."""

import random


def make_noisy_llm(correct: str, distractors: list[str], correct_rate: float, seed: int):
    """A mock LLM that returns `correct` with probability `correct_rate`
    and a random distractor otherwise."""
    rng = random.Random(seed)

    def mock_llm(prompt: str, n_samples: int) -> list[str]:
        out = []
        for _ in range(n_samples):
            if rng.random() < correct_rate:
                out.append(correct)
            else:
                out.append(rng.choice(distractors))
        return out

    return mock_llm


def test_majority_correct_yields_correct(solution):
    # 70% correct, 30% noise — majority of 21 samples should land on "83".
    mock = make_noisy_llm("83", ["20", "42", "100", "7"], correct_rate=0.7, seed=0)
    assert solution.self_consistency(mock, "what is x?", n_samples=21) == "83"


def test_passes_prompt_through(solution):
    seen = {}
    def mock(prompt, n):
        seen["prompt"] = prompt
        seen["n"] = n
        return ["x"] * n
    solution.self_consistency(mock, "hello", n_samples=3)
    assert seen == {"prompt": "hello", "n": 3}


def test_single_sample_returns_only_answer(solution):
    mock = lambda prompt, n: ["only"] * n
    assert solution.self_consistency(mock, "p", n_samples=1) == "only"


def test_zero_samples(solution):
    mock = lambda prompt, n: []
    assert solution.self_consistency(mock, "p", n_samples=0) == ""


def test_unanimous(solution):
    mock = lambda prompt, n: ["agreed"] * n
    assert solution.self_consistency(mock, "p", n_samples=10) == "agreed"


def test_tie_uses_alphabetical(solution):
    # Two answers, each 3 times — alphabetical wins.
    mock = lambda prompt, n: ["b", "b", "b", "a", "a", "a"]
    assert solution.self_consistency(mock, "p", n_samples=6) == "a"


def test_beats_single_shot_on_noisy_model(solution):
    """The point of self-consistency: voting recovers the right answer
    even when single-shot accuracy is well below 1.0."""
    correct = "83"
    distractors = ["20", "42", "100", "7"]
    correct_rate = 0.55  # majority-but-not-overwhelming

    # Over 30 problems, voting with N=15 should beat single-shot.
    n_problems = 30
    single_correct = 0
    voted_correct = 0
    for i in range(n_problems):
        mock = make_noisy_llm(correct, distractors, correct_rate, seed=i)
        if mock("p", 1)[0] == correct:
            single_correct += 1
        if solution.self_consistency(mock, "p", n_samples=15) == correct:
            voted_correct += 1
    assert voted_correct > single_correct


def test_returns_string(solution):
    mock = lambda prompt, n: ["a"] * n
    assert isinstance(solution.self_consistency(mock, "p", n_samples=3), str)
