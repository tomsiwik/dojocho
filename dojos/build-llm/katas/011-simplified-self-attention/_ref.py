"""Reference solution for Simplified Self-Attention."""

import torch


def attention_scores(x: torch.Tensor) -> torch.Tensor:
    return x @ x.transpose(-2, -1)


def attention_weights(scores: torch.Tensor) -> torch.Tensor:
    return torch.softmax(scores, dim=-1)


def simplified_self_attention(x: torch.Tensor) -> torch.Tensor:
    return attention_weights(attention_scores(x)) @ x
