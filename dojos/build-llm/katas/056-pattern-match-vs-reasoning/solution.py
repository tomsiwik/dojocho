"""Pattern Match vs Reasoning — build-reasoning ch1.

Two solvers for the same task (integer addition) that demonstrate the
core distinction from Raschka chapter 1: a *memorizer* (lookup table,
fails on novel inputs) and a *reasoner* (executes a procedure,
generalizes to any input).

The trick is to implement `solve_by_reasoning` WITHOUT using `int()` to
parse the operands — walk the digits with carry like you learned in
grade school. That manual procedure is the "reasoning" in this kata.
"""


def solve_by_memorize(problem: str, memo: dict[str, int]) -> int | None:
    """Return the memorized answer for `problem`, or None if unseen.

    `problem` is a string like '23 + 19'. `memo` maps problem strings to
    their integer answers. No computation — pure lookup.
    """
    ...  # implement me


def solve_by_reasoning(problem: str) -> int:
    """Parse the operands of `problem` and add them digit-by-digit with
    carry. Do NOT use `int(operand)` to do the addition for you — walk
    the digits manually so the procedure is visible.

    `problem` is of the form '<a> + <b>' with single spaces; operands are
    non-negative integers.
    """
    ...  # implement me
