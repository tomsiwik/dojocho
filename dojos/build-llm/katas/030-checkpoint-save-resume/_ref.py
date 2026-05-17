"""Reference for checkpoint-save-resume."""

from itertools import cycle

import torch
import torch.nn.functional as F


def save_checkpoint(path, model, optimizer, step):
    torch.save(
        {
            "model": model.state_dict(),
            "optimizer": optimizer.state_dict(),
            "step": step,
        },
        path,
    )


def load_checkpoint(path, model, optimizer):
    ckpt = torch.load(path, weights_only=False)
    model.load_state_dict(ckpt["model"])
    optimizer.load_state_dict(ckpt["optimizer"])
    return int(ckpt["step"])


def train_steps(model, optimizer, dataloader, n_steps):
    model.train()
    losses = []
    it = cycle(dataloader)
    for _ in range(n_steps):
        inputs, targets = next(it)
        optimizer.zero_grad()
        logits = model(inputs)
        V = logits.shape[-1]
        loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    return losses
