"""Chain-of-Thought Scorer — build-reasoning ch1.

Build the basic measurement instrument for reasoning research: given a
`(problem, response)` pair, count the intermediate reasoning steps and
extract the final answer. The kata deliberately separates the two
signals — correctness and step count — because the rest of build-
reasoning depends on being able to compare responses with and without
chain-of-thought.

A response is a string with steps separated by either '\\n' or '. '
(period + space). The last non-empty piece is the answer; everything
before is intermediate reasoning.
"""


def extract_steps(response: str) -> list[str]:
    """Split `response` on '\\n' or '. ', strip, drop empties.

    Returns the full list of pieces. The last element is the final
    answer; everything before is intermediate reasoning.
    """
    ...  # implement me


def extract_answer(response: str) -> str:
    """Return the last non-empty step, with any 'Answer: ' prefix and
    trailing period stripped.
    """
    ...  # implement me


def score(response: str, expected_answer: str) -> tuple[bool, int]:
    """Score a response.

    Returns `(correct, n_steps)` where:
      - `correct` is True iff `extract_answer(response) == expected_answer`.
      - `n_steps` is the number of intermediate steps (everything before
        the final answer). Always >= 0.
    """
    ...  # implement me
