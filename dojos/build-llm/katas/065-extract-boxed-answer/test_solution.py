"""Tests for extract-boxed-answer."""


def test_simple_box(solution):
    assert solution.extract_boxed(r"\boxed{42}") == "42"


def test_box_with_whitespace_inside(solution):
    assert solution.extract_boxed(r"\boxed{ 14/3 }") == " 14/3 "


def test_nested_braces(solution):
    """\\frac{14}{3} has internal braces — depth tracking is required."""
    assert solution.extract_boxed(r"\boxed{\frac{14}{3}}") == r"\frac{14}{3}"


def test_deeply_nested(solution):
    text = r"\boxed{\sqrt{\frac{a}{b+1}}}"
    assert solution.extract_boxed(text) == r"\sqrt{\frac{a}{b+1}}"


def test_multiple_boxes_returns_last(solution):
    """When the model wrote several boxes, take the final one."""
    text = r"intermediate \boxed{1} then \boxed{2} then \boxed{3}"
    assert solution.extract_boxed(text) == "3"


def test_box_inside_long_response(solution):
    text = (
        "**Step 1:** something\n\n"
        "**Step 2:** more work\n\n"
        "**Final Answer:**\n\n"
        r"\[ \boxed{\dfrac{14}{3}} \]"
    )
    assert solution.extract_boxed(text) == r"\dfrac{14}{3}"


def test_no_box_returns_none(solution):
    assert solution.extract_boxed("the answer is 42") is None


def test_empty_string_returns_none(solution):
    assert solution.extract_boxed("") is None


def test_unbalanced_braces_returns_none(solution):
    """If braces never close, the function must not loop forever or guess."""
    assert solution.extract_boxed(r"\boxed{ no close here") is None


def test_box_without_opening_brace_returns_none(solution):
    """`\\boxed` without `{` after it is not a valid box."""
    assert solution.extract_boxed(r"the word \boxed appears alone") is None


def test_empty_box_returns_empty_string(solution):
    """An empty `\\boxed{}` is a valid (if useless) box."""
    assert solution.extract_boxed(r"\boxed{}") == ""
