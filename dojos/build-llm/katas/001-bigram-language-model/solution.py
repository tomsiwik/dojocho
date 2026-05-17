"""001 — Bigram Language Model

Build a tiny language model from word-frequency tables. For each word in
the corpus, count what words tend to follow it; predict the most common
follower for a given input word.

This is the simplest possible "language model" — about 20 lines of pure
Python. It is in the same category as GPT-3; it just has much less
context (1 token) and no learned representation. The point of this
kata is to make next-token prediction visceral before any PyTorch.
"""

from collections import Counter


def tokenize(text: str) -> list[str]:
    """Lowercase, whitespace-split, strip trailing punctuation."""
    ...  # implement me


def build_bigrams(tokens: list[str]) -> dict[str, Counter]:
    """For each token, count what tokens follow it.

    Returns a dict-like where bigrams[w][w_next] is the count of
    `(w, w_next)` pairs in `tokens`.
    """
    ...  # implement me


def next_word(bigrams: dict[str, Counter], word: str) -> str:
    """Return the most common follower of `word`, or '<unknown>' if
    `word` never appeared in the training corpus.
    """
    ...  # implement me
