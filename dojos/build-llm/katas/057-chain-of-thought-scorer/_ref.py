"""Reference solution for chain-of-thought-scorer."""


def extract_steps(response: str) -> list[str]:
    normalized = response.replace(". ", "\n")
    pieces = normalized.split("\n")
    return [p.strip() for p in pieces if p.strip()]


def extract_answer(response: str) -> str:
    steps = extract_steps(response)
    if not steps:
        return ""
    last = steps[-1]
    last = last.removeprefix("Answer: ")
    last = last.rstrip(".")
    return last


def score(response: str, expected_answer: str) -> tuple[bool, int]:
    steps = extract_steps(response)
    answer = extract_answer(response)
    correct = answer == expected_answer
    n_steps = max(0, len(steps) - 1)
    return (correct, n_steps)
