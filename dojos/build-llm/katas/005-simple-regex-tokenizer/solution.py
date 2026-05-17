"""simple-regex-tokenizer — SimpleTokenizerV1

You've built a whitespace tokenizer that lowercases everything (kata 001).
That's fine for bigrams over a fixed corpus, but Raschka's chapter 2 raises
the bar:

  - keep capitalization (so "Jack" and "jack" are different — proper-noun
    information matters to an LLM)
  - keep punctuation as its own tokens (so "Hello," → ["Hello", ","])
  - support round-tripping: encode(decode(ids)) preserves the original text
    (modulo whitespace normalization)

You will implement Raschka's `SimpleTokenizerV1` from listing 2.3 — a
tokenizer with `encode` and `decode` methods over a fixed vocabulary.

It deliberately does NOT handle out-of-vocabulary words. encode() on a
new word will raise KeyError. That is the point: the next kata fixes it.

Tasks
-----
1. Implement `tokenize(text)` — split on the regex from §2.2:
   `r'([,.:;?_!"()\\']|--|\\s)'`, then strip whitespace items.

2. Implement `build_vocab(tokens)` — sorted, deterministic
   token -> int mapping. No special tokens.

3. Implement the `SimpleTokenizerV1` class:
   - `__init__(self, vocab)` — store both str->int and int->str maps.
   - `encode(self, text) -> list[int]` — tokenize, then look up each
     token in str_to_int. Raise KeyError on unknowns (don't catch).
   - `decode(self, ids) -> str` — look up each id in int_to_str, join
     with single spaces, then remove the space BEFORE punctuation
     (so "Hello ," becomes "Hello,") using the regex:
     `re.sub(r'\\s+([,.?!"()\\'])', r'\\1', text)`.
"""

import re


def tokenize(text: str) -> list[str]:
    """Split text on punctuation and whitespace, dropping whitespace-only
    items. Keeps capitalization. Punctuation tokens are kept as their
    own items.
    """
    ...  # implement me


def build_vocab(tokens: list[str]) -> dict[str, int]:
    """Return sorted token -> int mapping (deterministic)."""
    ...  # implement me


class SimpleTokenizerV1:
    """Encode/decode text using a fixed vocabulary.

    Raises KeyError on out-of-vocabulary tokens in encode(). The next
    kata fixes this with an <|unk|> sentinel.
    """

    def __init__(self, vocab: dict[str, int]):
        ...  # implement me

    def encode(self, text: str) -> list[int]:
        ...  # implement me

    def decode(self, ids: list[int]) -> str:
        ...  # implement me
