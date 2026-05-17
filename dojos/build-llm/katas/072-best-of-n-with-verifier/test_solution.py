"""Tests for best-of-n-with-verifier."""


def test_verifier_picks_winner(solution):
    candidates = ["short", "a longer answer", "tiny"]
    score = lambda s: float(len(s))
    assert solution.best_of_n(candidates, score) == "a longer answer"


def test_tie_returns_first(solution):
    # All candidates score equally -> first one wins.
    candidates = ["a", "b", "c"]
    score = lambda s: 1.0
    assert solution.best_of_n(candidates, score) == "a"


def test_tie_at_top_is_stable(solution):
    # "x" and "z" both score 2.0; "x" appears first.
    candidates = ["y", "x", "z"]
    score = lambda s: {"x": 2.0, "y": 1.0, "z": 2.0}[s]
    assert solution.best_of_n(candidates, score) == "x"


def test_single_candidate(solution):
    assert solution.best_of_n(["only"], lambda s: 0.0) == "only"


def test_empty(solution):
    assert solution.best_of_n([], lambda s: 1.0) == ""


def test_negative_scores(solution):
    # Higher is better, even when "higher" is "less negative".
    candidates = ["bad", "worse"]
    score = lambda s: -1.0 if s == "bad" else -5.0
    assert solution.best_of_n(candidates, score) == "bad"


def test_verifier_called_once_per_candidate(solution):
    """The verifier may be expensive — don't call it more than once per
    candidate."""
    calls = []
    def score(s):
        calls.append(s)
        return float(len(s))

    solution.best_of_n(["a", "bb", "ccc"], score)
    assert sorted(calls) == ["a", "bb", "ccc"]


def test_exact_match_verifier(solution):
    """Classic best-of-N: verifier returns 1.0 for the correct answer."""
    target = "83"
    candidates = ["20", "100", "83", "42"]
    score = lambda s: 1.0 if s == target else 0.0
    assert solution.best_of_n(candidates, score) == "83"


def test_returns_string(solution):
    result = solution.best_of_n(["a"], lambda s: 1.0)
    assert isinstance(result, str)
