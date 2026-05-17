"""gpt-dataset — Raschka's GPTDatasetV1 with a sliding window

In kata `004-training-pairs-from-text` you built a pure-Python sliding
window over token ids. Now wrap the same idea in PyTorch's `Dataset`
protocol so the rest of the training stack (DataLoader, multi-worker
prefetch, shuffle, drop_last) can plug in for free.

This is Raschka listing 2.5 + 2.6, almost verbatim.

The class
---------
`GPTDatasetV1` takes a string `txt`, a `tokenizer` (anything with an
`encode(str) -> list[int]` method — tiktoken works), `max_length`
(window size), and `stride` (step between windows).

Inside `__init__`:
  1. tokenize txt -> token_ids
  2. for i in range(0, len(token_ids) - max_length, stride):
       input_chunk  = token_ids[i : i + max_length]
       target_chunk = token_ids[i + 1 : i + 1 + max_length]
       store as torch.tensor in self.input_ids and self.target_ids

Then:
  - __len__   -> number of windows
  - __getitem__(idx) -> (input_tensor, target_tensor)

Then build a DataLoader factory.

Tasks
-----
1. Implement `GPTDatasetV1.__init__`, `__len__`, `__getitem__`.

2. Implement `create_dataloader_v1(txt, tokenizer, batch_size,
   max_length, stride, shuffle=False, drop_last=True, num_workers=0)`
   returning `torch.utils.data.DataLoader`.

Pitfall preview: the range upper bound is `len(token_ids) - max_length`
NOT `len(token_ids) - max_length + 1`. Off-by-one here means your
target_chunk walks off the end on the last iteration.
"""

import torch
from torch.utils.data import Dataset, DataLoader


class GPTDatasetV1(Dataset):
    def __init__(self, txt: str, tokenizer, max_length: int, stride: int):
        ...  # implement me

    def __len__(self) -> int:
        ...  # implement me

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        ...  # implement me


def create_dataloader_v1(
    txt: str,
    tokenizer,
    batch_size: int = 4,
    max_length: int = 256,
    stride: int = 128,
    shuffle: bool = False,
    drop_last: bool = True,
    num_workers: int = 0,
) -> DataLoader:
    """Wrap GPTDatasetV1 in a PyTorch DataLoader."""
    ...  # implement me
