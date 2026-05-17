"""llm-judge-mock — a deterministic rule-based stand-in for an LLM judge.

The real version (appendix F.5) prompts a strong LLM with a 1-5 rubric.
This mock implements the same interface using rules so you can:
  - test calling code without an LLM dependency
  - reason about what the judge is actually rewarding

Rubric:
  5: high overlap with reference (f1 >= 0.85)
  4: substantial overlap         (f1 >= 0.60)
  3: partial overlap             (f1 >= 0.30)
  2: weak overlap                (f1 >  0.00)
  1: punt/refusal/empty, or no overlap

Punt phrases (case-insensitive substring match):
  "i don't know", "i cannot", "i can't", "as an ai",
  "i'm unable", "i am unable"
"""


def judge(question: str, response: str, reference: str) -> int:
    """Return a 1-5 score for `response` against `reference`.

    `question` is unused in this rule-based judge but is part of the
    signature so calling code can swap in a real LLM judge later
    without changing its API.
    """
    ...  # implement me
