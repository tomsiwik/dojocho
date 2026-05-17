"""004 — Training Pairs from Text

Turn raw text into (input, target) pairs via the sliding-window trick
from Raschka chapter 2. The "target" is always the input shifted right
by one token — that's self-supervision in three lines.
"""

from typing import Iterator


def build_vocab(tokens: list[str], include_unk: bool = True) -> dict[str, int]:
    """Sorted, deterministic token → integer-ID mapping.

    Reserves ID 0 for '<unk>' when include_unk=True.
    """
    ...  # implement me


def tokenize_to_ids(text: str, vocab: dict[str, int]) -> list[int]:
    """Lowercase, whitespace-split, strip trailing punctuation, then look
    up each token in `vocab`. Unknown tokens map to vocab['<unk>'] if
    present, else raise KeyError.
    """
    ...  # implement me


def sliding_window_pairs(
    ids: list[int],
    max_length: int,
    stride: int = 1,
) -> Iterator[tuple[list[int], list[int]]]:
    """Yield (input_chunk, target_chunk) pairs, each of length max_length.

    target_chunk is input_chunk shifted right by one. Step by `stride`
    between chunks. Stop before the target walks past the end.
    """
    ...  # implement me
