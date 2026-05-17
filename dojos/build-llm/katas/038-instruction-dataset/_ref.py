"""Reference solution for instruction-dataset."""

from typing import Optional

import torch
from torch.utils.data import Dataset


PREAMBLE = (
    "Below is an instruction that describes a task. "
    "Write a response that appropriately completes the request."
)


def format_alpaca(instruction: str, response: Optional[str] = None) -> str:
    body = f"{PREAMBLE}\n\n### Instruction:\n{instruction}"
    if response is None:
        return body + "\n\n### Response:\n"
    return body + f"\n\n### Response:\n{response}"


class InstructionDataset(Dataset):
    def __init__(self, examples, tokenizer, max_length: int):
        self.examples = list(examples)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, idx: int):
        ex = self.examples[idx]
        prompt_text = format_alpaca(ex["instruction"], response=None)
        full_text = format_alpaca(ex["instruction"], response=ex["response"])

        prompt_ids = self.tokenizer.encode(prompt_text)
        full_ids = self.tokenizer.encode(full_text)

        # Standard LM shift.
        input_seq = full_ids[:-1]
        target_seq = full_ids[1:]
        seam = len(prompt_ids) - 1  # first response target index
        response_len = len(full_ids) - len(prompt_ids)

        L = self.max_length
        pad_id = self.tokenizer.pad_id

        input_ids = torch.full((L,), pad_id, dtype=torch.long)
        target_ids = torch.full((L,), pad_id, dtype=torch.long)
        mask = torch.zeros(L, dtype=torch.long)

        n = min(len(input_seq), L)
        input_ids[:n] = torch.tensor(input_seq[:n], dtype=torch.long)
        m = min(len(target_seq), L)
        target_ids[:m] = torch.tensor(target_seq[:m], dtype=torch.long)

        # Mask response positions only, clipped to L.
        resp_start = min(seam, L)
        resp_end = min(seam + response_len, L)
        if resp_end > resp_start:
            mask[resp_start:resp_end] = 1

        return input_ids, target_ids, mask
