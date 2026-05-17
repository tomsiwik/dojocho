"""Reference solution for bpe-via-tiktoken."""

import tiktoken


def get_encoder() -> tiktoken.Encoding:
    return tiktoken.get_encoding("gpt2")


def encode(text: str, encoder: tiktoken.Encoding) -> list[int]:
    return encoder.encode(text)


def encode_with_endoftext(text: str, encoder: tiktoken.Encoding) -> list[int]:
    return encoder.encode(text, allowed_special={"<|endoftext|>"})


def decode_each(ids: list[int], encoder: tiktoken.Encoding) -> list[str]:
    return [encoder.decode([i]) for i in ids]


def decode(ids: list[int], encoder: tiktoken.Encoding) -> str:
    return encoder.decode(ids)


def vocab_size(encoder: tiktoken.Encoding) -> int:
    return encoder.n_vocab
