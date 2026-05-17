"""Tests for Chain-of-Thought Scorer."""


# ----- extract_steps -----


def test_extract_steps_splits_on_newline(solution):
    steps = solution.extract_steps("first\nsecond\nthird")
    assert steps == ["first", "second", "third"]


def test_extract_steps_splits_on_period_space(solution):
    steps = solution.extract_steps("first. second. third")
    assert steps == ["first", "second", "third"]


def test_extract_steps_drops_empties(solution):
    steps = solution.extract_steps("a\n\nb. . c")
    assert steps == ["a", "b", "c"]


def test_extract_steps_strips_whitespace(solution):
    steps = solution.extract_steps("  a  \n  b  ")
    assert steps == ["a", "b"]


# ----- extract_answer -----


def test_extract_answer_simple(solution):
    assert solution.extract_answer("Answer: 42") == "42"


def test_extract_answer_with_steps(solution):
    response = "First do this\nThen do that\nAnswer: 7"
    assert solution.extract_answer(response) == "7"


def test_extract_answer_strips_trailing_period(solution):
    assert solution.extract_answer("Answer: 42.") == "42"


def test_extract_answer_no_answer_prefix(solution):
    """If the final step doesn't have 'Answer: ', return it as-is."""
    assert solution.extract_answer("step one. 42") == "42"


# ----- score -----


def test_score_correct_no_cot(solution):
    """No intermediate reasoning, correct answer => (True, 0)."""
    correct, n_steps = solution.score("Answer: 42", "42")
    assert correct is True
    assert n_steps == 0


def test_score_correct_with_cot(solution):
    """With intermediate steps, same correctness, but n_steps > 0."""
    response = "23 + 19. First 3+9=12 carry 1. 2+1+1=4. Answer: 42"
    correct, n_steps = solution.score(response, "42")
    assert correct is True
    assert n_steps >= 3


def test_score_wrong_answer_no_credit(solution):
    """A wrong final answer scores as incorrect, even with many steps."""
    response = "Step 1. Step 2. Step 3. Step 4. Answer: 99"
    correct, n_steps = solution.score(response, "42")
    assert correct is False
    assert n_steps == 4


def test_score_n_steps_never_negative(solution):
    """Even a one-token response shouldn't yield negative n_steps."""
    _, n_steps = solution.score("42", "42")
    assert n_steps >= 0


def test_score_returns_tuple_of_correct_types(solution):
    result = solution.score("Answer: 1", "1")
    assert isinstance(result, tuple)
    assert len(result) == 2
    correct, n_steps = result
    assert isinstance(correct, bool)
    assert isinstance(n_steps, int)


def test_score_same_answer_credit_regardless_of_cot(solution):
    """The whole point: a correct answer counts as correct whether or
    not the model showed its work. n_steps separates the two signals.
    """
    no_cot = "Answer: 100"
    with_cot = "50 + 50. 0+0=0. 5+5=10. Answer: 100"
    c1, n1 = solution.score(no_cot, "100")
    c2, n2 = solution.score(with_cot, "100")
    assert c1 is True and c2 is True
    assert n1 == 0
    assert n2 > 0
