"""Reference solution for tokenizer-with-special-tokens."""

import re

END_OF_TEXT = "<|endoftext|>"
UNK = "<|unk|>"

_SPLIT = re.compile(r'([,.:;?_!"()\']|--|\s)')
_DESPACE = re.compile(r'\s+([,.?!"()\'])')


def _tokenize(text: str) -> list[str]:
    parts = _SPLIT.split(text)
    return [p.strip() for p in parts if p.strip()]


def build_vocab_v2(tokens: list[str]) -> dict[str, int]:
    base = sorted(set(tokens))
    all_tokens = base + [END_OF_TEXT, UNK]
    return {tok: i for i, tok in enumerate(all_tokens)}


class SimpleTokenizerV2:
    def __init__(self, vocab: dict[str, int]):
        self.str_to_int = vocab
        self.int_to_str = {i: s for s, i in vocab.items()}

    def encode(self, text: str) -> list[int]:
        # Split on the endoftext marker first so we don't tokenize it.
        chunks = text.split(END_OF_TEXT)
        out: list[str] = []
        for i, chunk in enumerate(chunks):
            if i > 0:
                out.append(END_OF_TEXT)
            out.extend(_tokenize(chunk))
        # Map OOV to UNK.
        out = [t if t in self.str_to_int else UNK for t in out]
        return [self.str_to_int[t] for t in out]

    def decode(self, ids: list[int]) -> str:
        text = " ".join(self.int_to_str[i] for i in ids)
        return _DESPACE.sub(r'\1', text)
