"""exact-match-and-f1 — the SQuAD evaluation pair.

Two metrics, one normalizer.

- `exact_match`: returns 1 if normalized prediction equals normalized
  gold, else 0. All-or-nothing.

- `f1_score`: token-bag overlap (precision/recall harmonic mean).
  Gives partial credit when the prediction has *some* of the right
  tokens.

Both come from the original SQuAD paper (2016) and are still the
default reporting pair for short-answer QA benchmarks.
"""


def normalize(text: str) -> str:
    """Lowercase, strip articles (a/an/the), strip punctuation, collapse whitespace."""
    ...  # implement me


def exact_match(pred: str, gold: str) -> int:
    """Return 1 if normalize(pred) == normalize(gold), else 0."""
    ...  # implement me


def f1_score(pred_tokens: list[str], gold_tokens: list[str]) -> float:
    """Token-bag F1 (multiset precision/recall harmonic mean).

    Empty conventions:
    - both empty: 1.0 (vacuously correct)
    - one empty:  0.0
    - no overlap: 0.0
    """
    ...  # implement me
