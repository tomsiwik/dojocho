"""tokenizer-with-special-tokens — SimpleTokenizerV2

V1 crashed on OOV words. V2 patches it by adding two special tokens to
the vocabulary:

  - <|unk|>       — for any token not in the vocabulary
  - <|endoftext|> — separator between unrelated documents

Now encode() never crashes, and the model has a way to express "an
unknown word happened here" rather than "this input is invalid."

You'll also see, when running the tests, that the round-trip is now
LOSSY — decode(encode("Hello")) returns "<|unk|>". This is a real
tradeoff: V2 is robust but throws away word identity. The next kata
(BPE via tiktoken) addresses that.

Tasks
-----
1. Implement `build_vocab_v2(tokens)` — sorted base vocab PLUS
   `<|endoftext|>` and `<|unk|>` appended at the end (so they get the
   two largest ids).

2. Implement `SimpleTokenizerV2`:
   - `encode(self, text)` — tokenize, then for any token NOT in
     str_to_int, substitute `<|unk|>`. Look up all ids.
     `<|endoftext|>` already in the text must pass through untouched.
   - `decode(self, ids)` — same shape as V1 (join + de-space
     punctuation).

Use the same regex as V1 for tokenization:
    r'([,.:;?_!"()\\']|--|\\s)'

But: `<|endoftext|>` contains punctuation! If you naively re-split it,
you'll get `['<', '|', 'endoftext', '|', '>']`. Easiest fix: split on
`<|endoftext|>` first, tokenize each piece with the regex, then
re-interleave the marker tokens.
"""

import re


END_OF_TEXT = "<|endoftext|>"
UNK = "<|unk|>"


def build_vocab_v2(tokens: list[str]) -> dict[str, int]:
    """Sorted base vocab with <|endoftext|> and <|unk|> appended."""
    ...  # implement me


class SimpleTokenizerV2:
    """Like V1 but maps OOV words to <|unk|> and passes <|endoftext|>
    through as its own token.
    """

    def __init__(self, vocab: dict[str, int]):
        ...  # implement me

    def encode(self, text: str) -> list[int]:
        ...  # implement me

    def decode(self, ids: list[int]) -> str:
        ...  # implement me
