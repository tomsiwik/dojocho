"""bpe-via-tiktoken — Subword tokenization with OpenAI's tiktoken

V2 patched the OOV problem with `<|unk|>`, at the cost of throwing away
the identity of every unknown word. Byte Pair Encoding (BPE) solves OOV
*for real*: instead of one id per word, BPE represents rare words as
sequences of subword pieces, all of which were seen during training.

You will NOT implement BPE in this kata (it's a multi-thousand-line
algorithm). You'll *use* OpenAI's `tiktoken` library — the production
tokenizer behind GPT-2 / GPT-3 / GPT-3.5 — and demonstrate the subword
decomposition behavior.

Before running the tests, predict (PRIMM-style) what these should return:

    enc.encode("Hello")                   # one id?
    enc.encode("antidisestablishmentarianism")  # how many?
    enc.encode("someunknownPlace")        # split where?

Then run and see how you did.

Tasks
-----
1. Implement `get_encoder()` — return `tiktoken.get_encoding("gpt2")`.

2. Implement `encode(text, encoder)` — return list of int ids using
   the encoder's encode method. Plain text only (no special tokens).

3. Implement `encode_with_endoftext(text, encoder)` — same as encode
   but allows the `<|endoftext|>` special token through.
   Use `encoder.encode(text, allowed_special={"<|endoftext|>"})`.

4. Implement `decode_each(ids, encoder)` — return `list[str]` where
   each entry is the decoded string for one id (so you can SEE the
   subword pieces). Use `encoder.decode([single_id])` per id.

5. Implement `decode(ids, encoder)` — return the full decoded string
   via `encoder.decode(ids)`.

6. Implement `vocab_size(encoder)` — return `encoder.n_vocab`
   (50,257 for gpt2).
"""

import tiktoken


def get_encoder() -> tiktoken.Encoding:
    """Return the GPT-2 BPE encoder from tiktoken."""
    ...  # implement me


def encode(text: str, encoder: tiktoken.Encoding) -> list[int]:
    """Plain text → token ids. No special tokens allowed."""
    ...  # implement me


def encode_with_endoftext(text: str, encoder: tiktoken.Encoding) -> list[int]:
    """Like encode but allows <|endoftext|> through as a single token."""
    ...  # implement me


def decode_each(ids: list[int], encoder: tiktoken.Encoding) -> list[str]:
    """For each id, decode it individually. Lets you SEE the subword
    decomposition.
    """
    ...  # implement me


def decode(ids: list[int], encoder: tiktoken.Encoding) -> str:
    """Decode the whole id list back to a string."""
    ...  # implement me


def vocab_size(encoder: tiktoken.Encoding) -> int:
    """Return the encoder's vocabulary size."""
    ...  # implement me
