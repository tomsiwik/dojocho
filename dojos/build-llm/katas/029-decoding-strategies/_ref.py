"""Reference for decoding-strategies."""

import torch
import torch.nn.functional as F


def greedy(logits):
    return logits.argmax().long()


def temperature_sample(logits, temperature, rng=None):
    if temperature == 0.0:
        return greedy(logits)
    probs = F.softmax(logits / temperature, dim=-1)
    return torch.multinomial(probs, num_samples=1, generator=rng).squeeze().long()


def top_k_sample(logits, k, rng=None):
    if k == 1:
        return greedy(logits)
    values, _ = torch.topk(logits, k)
    threshold = values[-1]
    masked = torch.where(logits >= threshold, logits, torch.full_like(logits, float("-inf")))
    probs = F.softmax(masked, dim=-1)
    return torch.multinomial(probs, num_samples=1, generator=rng).squeeze().long()


def top_p_sample(logits, p, rng=None):
    sorted_logits, sorted_idx = logits.sort(descending=True)
    cumprobs = F.softmax(sorted_logits, dim=-1).cumsum(dim=-1)
    # Mask tokens whose cumulative prob exceeds p — but shift right
    # so we always keep at least the top-1 token.
    sorted_mask = cumprobs > p
    sorted_mask[..., 1:] = sorted_mask[..., :-1].clone()
    sorted_mask[..., 0] = False
    # Scatter mask back to original order.
    mask = torch.zeros_like(sorted_mask)
    mask.scatter_(-1, sorted_idx, sorted_mask)
    masked_logits = logits.masked_fill(mask, float("-inf"))
    probs = F.softmax(masked_logits, dim=-1)
    return torch.multinomial(probs, num_samples=1, generator=rng).squeeze().long()
