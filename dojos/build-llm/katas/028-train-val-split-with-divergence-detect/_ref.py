"""Reference for train-val-split-with-divergence-detect."""

import torch
import torch.nn.functional as F


def evaluate(model, dataloader):
    model.eval()
    total = 0.0
    n = 0
    with torch.no_grad():
        for inputs, targets in dataloader:
            logits = model(inputs)
            V = logits.shape[-1]
            loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
            total += loss.item()
            n += 1
    return total / max(n, 1)


def _train_one_epoch(model, optimizer, dataloader):
    model.train()
    total = 0.0
    n = 0
    for inputs, targets in dataloader:
        optimizer.zero_grad()
        logits = model(inputs)
        V = logits.shape[-1]
        loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
        loss.backward()
        optimizer.step()
        total += loss.item()
        n += 1
    return total / max(n, 1)


def train_with_val(model, optimizer, train_loader, val_loader, num_epochs):
    train_losses, val_losses = [], []
    for _ in range(num_epochs):
        train_losses.append(_train_one_epoch(model, optimizer, train_loader))
        val_losses.append(evaluate(model, val_loader))
    return train_losses, val_losses


def detect_overfit(train_losses, val_losses):
    running_min = val_losses[0]
    for i in range(1, len(val_losses)):
        if val_losses[i] > running_min:
            return i
        running_min = min(running_min, val_losses[i])
    return -1
