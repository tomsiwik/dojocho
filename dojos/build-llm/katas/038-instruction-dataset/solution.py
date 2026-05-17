"""Instruction Dataset

Turn a list of (instruction, response) dicts into
(input_ids, target_ids, mask) triples suitable for instruction
fine-tuning. The mask is 0 on prompt and padding positions, 1 on
response positions.
"""

from typing import Optional

import torch
from torch.utils.data import Dataset


PREAMBLE = (
    "Below is an instruction that describes a task. "
    "Write a response that appropriately completes the request."
)


def format_alpaca(instruction: str, response: Optional[str] = None) -> str:
    """Alpaca prompt; if response is None, ends with `### Response:\\n`
    (inference shape).
    """
    body = f"{PREAMBLE}\n\n### Instruction:\n{instruction}"
    if response is None:
        return body + "\n\n### Response:\n"
    return body + f"\n\n### Response:\n{response}"


class InstructionDataset(Dataset):
    """Yields (input_ids, target_ids, mask) for each example.

    Parameters
    ----------
    examples : list[dict]
        Each dict has keys "instruction" and "response".
    tokenizer : object
        Must provide `encode(text) -> list[int]` and `pad_id: int`.
    max_length : int
        All sequences are padded or truncated to this length.
    """

    def __init__(self, examples, tokenizer, max_length: int):
        ...  # implement me

    def __len__(self) -> int:
        ...  # implement me

    def __getitem__(self, idx: int):
        """Return (input_ids, target_ids, mask) as torch.long tensors.

        All three tensors have shape (max_length,).
        mask == 0 on prompt and padding positions, 1 on response positions.
        """
        ...  # implement me
