"""Reference implementation for training-loop."""

import torch
import torch.nn.functional as F


def train_one_epoch(model, optimizer, dataloader, device="cpu"):
    model.train()
    total = 0.0
    n = 0
    for inputs, targets in dataloader:
        inputs = inputs.to(device)
        targets = targets.to(device)
        optimizer.zero_grad()
        logits = model(inputs)
        V = logits.shape[-1]
        loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
        loss.backward()
        optimizer.step()
        total += loss.item()
        n += 1
    return total / max(n, 1)


def train(model, optimizer, dataloader, num_epochs, device="cpu"):
    return [train_one_epoch(model, optimizer, dataloader, device) for _ in range(num_epochs)]
