"""Reference solution for pattern-match-vs-reasoning."""


def solve_by_memorize(problem: str, memo: dict[str, int]) -> int | None:
    return memo.get(problem)


def solve_by_reasoning(problem: str) -> int:
    a_str, b_str = problem.strip().split(" + ")
    a_digits = list(reversed(a_str))
    b_digits = list(reversed(b_str))
    n = max(len(a_digits), len(b_digits))
    out_digits = []
    carry = 0
    for i in range(n):
        a = ord(a_digits[i]) - ord("0") if i < len(a_digits) else 0
        b = ord(b_digits[i]) - ord("0") if i < len(b_digits) else 0
        s = a + b + carry
        out_digits.append(s % 10)
        carry = s // 10
    if carry:
        out_digits.append(carry)
    result = 0
    for d in reversed(out_digits):
        result = result * 10 + d
    return result
