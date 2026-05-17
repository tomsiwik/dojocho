"""Reference solution for embeddings-and-lookup."""

import torch
import torch.nn as nn
import torch.nn.functional as F


def make_embedding(vocab_size: int, d_model: int, seed: int = 0) -> nn.Embedding:
    torch.manual_seed(seed)
    return nn.Embedding(vocab_size, d_model)


def embed_via_lookup(ids: torch.Tensor, embedding: nn.Embedding) -> torch.Tensor:
    return embedding(ids)


def embed_via_onehot_matmul(
    ids: torch.Tensor, embedding: nn.Embedding
) -> torch.Tensor:
    vocab_size = embedding.weight.shape[0]
    one_hot = F.one_hot(ids, num_classes=vocab_size).float()
    return one_hot @ embedding.weight


def embed_batch(
    ids: torch.Tensor, vocab_size: int, d_model: int, seed: int = 0
) -> torch.Tensor:
    emb = make_embedding(vocab_size, d_model, seed=seed)
    return embed_via_lookup(ids, emb)
