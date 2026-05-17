"""Reference solution for simple-regex-tokenizer."""

import re

_SPLIT = re.compile(r'([,.:;?_!"()\']|--|\s)')
_DESPACE = re.compile(r'\s+([,.?!"()\'])')


def tokenize(text: str) -> list[str]:
    parts = _SPLIT.split(text)
    return [p.strip() for p in parts if p.strip()]


def build_vocab(tokens: list[str]) -> dict[str, int]:
    return {tok: i for i, tok in enumerate(sorted(set(tokens)))}


class SimpleTokenizerV1:
    def __init__(self, vocab: dict[str, int]):
        self.str_to_int = vocab
        self.int_to_str = {i: s for s, i in vocab.items()}

    def encode(self, text: str) -> list[int]:
        toks = tokenize(text)
        return [self.str_to_int[t] for t in toks]

    def decode(self, ids: list[int]) -> str:
        text = " ".join(self.int_to_str[i] for i in ids)
        return _DESPACE.sub(r'\1', text)
