"""Reference solution for dataset-dataloader-device."""

import torch
from torch.utils.data import DataLoader, Dataset


class ToyDataset(Dataset):
    def __init__(self, X, y):
        super().__init__()
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def make_dataloader(dataset, batch_size=2):
    return DataLoader(dataset, batch_size=batch_size, shuffle=False)


def get_device():
    mps_ns = getattr(torch.backends, "mps", None)
    if (
        mps_ns is not None
        and mps_ns.is_available()
        and mps_ns.is_built()
    ):
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")
