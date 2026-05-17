"""Tests for best-of-refined."""


def make_appender(suffix):
    """Generator that appends `suffix` to whatever it's given."""
    def gen(text):
        return text + suffix
    return gen


def test_returns_highest_scoring_final(solution):
    """Pick the generator whose final answer scores highest."""
    g_short = make_appender("!")     # short suffix
    g_long = make_appender("xxxxx")  # long suffix
    # Scorer prefers shorter answers.
    scorer = lambda a: -len(a)
    result = solution.best_of_refined(
        prompt="q",
        generate_fns=[g_short, g_long],
        scorer=scorer,
        n_refine=2,
    )
    # g_short: "q" -> "q!" -> "q!!" -> "q!!!" (length 4)
    # g_long:  "q" -> "qxxxxx" -> "qxxxxxxxxxx" -> "qxxxxxxxxxxxxxxx" (length 16)
    assert result == "q!!!"


def test_n_refine_zero_is_just_best_of_n(solution):
    """With no refinement, each generator is called exactly once."""
    calls_a = []
    calls_b = []

    def gen_a(text):
        calls_a.append(text)
        return "A"

    def gen_b(text):
        calls_b.append(text)
        return "BB"

    scorer = lambda a: len(a)  # prefer longer
    result = solution.best_of_refined("q", [gen_a, gen_b], scorer, n_refine=0)
    assert result == "BB"
    assert calls_a == ["q"]
    assert calls_b == ["q"]


def test_total_calls_per_generator(solution):
    """`1 + n_refine` calls per generator."""
    counter = {"n": 0}

    def gen(text):
        counter["n"] += 1
        return text + "."

    solution.best_of_refined("seed", [gen, gen, gen], scorer=lambda a: 0.0, n_refine=4)
    # 3 generators * (1 + 4) calls = 15
    assert counter["n"] == 15


def test_refinement_feeds_previous_answer(solution):
    """After the draft, each pass receives the previous answer."""
    seen = []

    def gen(text):
        seen.append(text)
        return text + "+"

    solution.best_of_refined("start", [gen], scorer=lambda a: 0.0, n_refine=3)
    # First call sees the prompt; subsequent calls see the growing chain.
    assert seen == ["start", "start+", "start++", "start+++"]


def test_tie_breaks_to_first_generator(solution):
    """Stable selection: first generator wins on a tie."""
    gen_a = lambda t: "A"
    gen_b = lambda t: "B"
    # Constant scorer -> both tie at 0.0.
    result = solution.best_of_refined("q", [gen_a, gen_b], scorer=lambda a: 0.0, n_refine=0)
    assert result == "A"


def test_single_generator(solution):
    """One generator, no competition — return its refined output."""
    gen = make_appender("*")
    result = solution.best_of_refined("x", [gen], scorer=lambda a: 1.0, n_refine=2)
    assert result == "x***"


def test_scorer_called_on_final_only(solution):
    """Scorer must be called on each generator's final answer, not intermediates."""
    scored = []

    def scorer(answer):
        scored.append(answer)
        return len(answer)

    g = make_appender(".")
    solution.best_of_refined("p", [g, g], scorer, n_refine=2)
    # Two generators, each producing final "p..." -> scorer sees "p..." twice.
    assert scored == ["p...", "p..."]


def test_returns_string(solution):
    g = make_appender("y")
    result = solution.best_of_refined("x", [g], scorer=lambda a: 0.0, n_refine=1)
    assert isinstance(result, str)
