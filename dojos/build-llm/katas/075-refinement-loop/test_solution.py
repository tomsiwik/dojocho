"""Tests for refinement-loop."""


def test_n_max_zero_is_noop(solution):
    """With zero rounds, the initial answer must pass through."""
    critic = lambda a: "should not be called"
    reviser = lambda a, c: "WRONG"
    assert solution.refine("initial", critic, reviser, n_max=0) == "initial"


def test_single_iteration_calls_both(solution):
    """One round: critic runs once, reviser runs once."""
    calls = []

    def critic(answer):
        calls.append(("critic", answer))
        return "make it louder"

    def reviser(answer, critique):
        calls.append(("reviser", answer, critique))
        return answer.upper()

    result = solution.refine("hello", critic, reviser, n_max=1)
    assert result == "HELLO"
    assert calls == [
        ("critic", "hello"),
        ("reviser", "hello", "make it louder"),
    ]


def test_critic_sees_current_answer_each_round(solution):
    """The critique must be recomputed on each iteration's answer."""
    seen_by_critic = []

    def critic(answer):
        seen_by_critic.append(answer)
        return "+"

    def reviser(answer, critique):
        # Append a marker so each iteration produces a different answer.
        return answer + critique

    solution.refine("x", critic, reviser, n_max=3)
    # Round 1 sees "x"; round 2 sees "x+"; round 3 sees "x++".
    assert seen_by_critic == ["x", "x+", "x++"]


def test_returns_final_revised_answer(solution):
    """After n_max rounds, return the latest revision."""
    critic = lambda a: ""
    reviser = lambda a, c: a + "*"
    result = solution.refine("seed", critic, reviser, n_max=4)
    assert result == "seed****"


def test_default_n_max_is_five(solution):
    """Default budget is 5 rounds."""
    critic = lambda a: ""
    reviser = lambda a, c: a + "."
    result = solution.refine("start", critic, reviser)
    assert result == "start....."  # 5 dots


def test_reviser_receives_critique_string(solution):
    """The critique string must be threaded to the reviser unchanged."""
    received = []

    def critic(answer):
        return "verbatim critique"

    def reviser(answer, critique):
        received.append(critique)
        return answer

    solution.refine("a", critic, reviser, n_max=2)
    assert received == ["verbatim critique", "verbatim critique"]
