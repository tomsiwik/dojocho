"""003 — Encoder vs Decoder

Same data, two prediction tasks:

  Decoder-style (GPT-like): given previous, predict NEXT (causal).
  Encoder-style (BERT-like): given both sides, fill the BLANK.

The architecture that makes both feel native is the transformer with
optional causal masking — chapter 3. This kata is a pre-transformer
preview using only bigram tables.
"""

from collections import Counter


def build_directional_bigrams(
    tokens: list[str],
) -> tuple[dict[str, Counter], dict[str, Counter]]:
    """Return (left, right) where:

    right[w] = Counter of words that come AFTER w   (forward, GPT view)
    left[w]  = Counter of words that come BEFORE w  (backward, BERT view)
    """
    ...  # implement me


def predict_next(right: dict[str, Counter], word: str) -> str:
    """Decoder-style: most common follower of `word`, or '<unknown>'."""
    ...  # implement me


def fill_blank(
    sentence: list[str],
    left: dict[str, Counter],
    right: dict[str, Counter],
) -> str:
    """Encoder-style: predict the masked word.

    `sentence` contains exactly one "___" token. Vote using both the
    left context (right[before]) and the right context (left[after]),
    summing counts. Return the argmax.

    Edge cases:
      - blank at position 0      → use only left[after]
      - blank at last position   → use only right[before]
      - no candidates from either → return "<unknown>"
    """
    ...  # implement me
