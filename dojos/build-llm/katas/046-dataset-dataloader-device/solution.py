"""dataset-dataloader-device — Dataset, DataLoader, and a defensive
device selector.

The seam:
  - Dataset = how to load ONE example (I/O layer).
  - DataLoader = how to batch, shuffle, and queue (batching layer).

`get_device()` chooses mps -> cuda -> cpu so the same script runs on
your laptop, workstation, and CI server without modification.
"""

import torch
from torch.utils.data import DataLoader, Dataset


class ToyDataset(Dataset):
    """An in-memory dataset of (X, y) pairs.

    __init__: store X (shape (N, ...)) and y (shape (N, ...)).
    __len__:  return N.
    __getitem__(idx): return ONE (x_i, y_i) pair as a tuple of tensors.
    """

    def __init__(self, X: torch.Tensor, y: torch.Tensor) -> None:
        super().__init__()
        ...  # implement me

    def __len__(self) -> int:
        ...  # implement me

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        ...  # implement me


def make_dataloader(dataset: Dataset, batch_size: int = 2) -> DataLoader:
    """Wrap `dataset` in a DataLoader with batch_size=batch_size,
    shuffle=False."""
    ...  # implement me


def get_device() -> torch.device:
    """Return the best available device in the order: mps -> cuda -> cpu.

    Must never raise. The test runs on machines without CUDA or MPS.
    """
    ...  # implement me
