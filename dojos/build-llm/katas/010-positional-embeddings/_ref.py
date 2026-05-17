"""Reference solution for positional-embeddings."""

import torch
import torch.nn as nn


def make_positional_embedding(
    context_length: int, d_model: int, seed: int = 0
) -> nn.Embedding:
    torch.manual_seed(seed)
    return nn.Embedding(context_length, d_model)


def position_ids(T: int, device: torch.device | None = None) -> torch.Tensor:
    if device is None:
        return torch.arange(T)
    return torch.arange(T, device=device)


def add_positional(
    token_emb: torch.Tensor, pos_emb_layer: nn.Embedding
) -> torch.Tensor:
    T = token_emb.shape[1]
    pos = pos_emb_layer(position_ids(T, device=token_emb.device))
    return token_emb + pos  # broadcast (T, D) over (B, T, D)


def forward_input_pipeline(
    ids: torch.Tensor,
    vocab_size: int,
    d_model: int,
    context_length: int,
    seed: int = 0,
) -> torch.Tensor:
    torch.manual_seed(seed)
    token_emb_layer = nn.Embedding(vocab_size, d_model)
    # Independent seed offset so pos != token; doesn't matter functionally.
    torch.manual_seed(seed + 1)
    pos_emb_layer = nn.Embedding(context_length, d_model)

    token_emb = token_emb_layer(ids)  # (B, T, D)
    return add_positional(token_emb, pos_emb_layer)


def _sort_rows(mat: torch.Tensor) -> torch.Tensor:
    """Sort a (T, D) matrix by its first column, for set-equality test."""
    idx = torch.argsort(mat[:, 0])
    return mat[idx]


def demonstrate_position_blindness(
    vocab_size: int, d_model: int, seed: int = 0
) -> tuple[bool, bool]:
    torch.manual_seed(seed)
    tok = nn.Embedding(vocab_size, d_model)
    torch.manual_seed(seed + 1)
    pos = nn.Embedding(3, d_model)

    ids_fwd = torch.tensor([[1, 2, 3]])
    ids_rev = torch.tensor([[3, 2, 1]])

    tok_fwd = tok(ids_fwd).squeeze(0)  # (3, D)
    tok_rev = tok(ids_rev).squeeze(0)  # (3, D)
    without_pos = torch.equal(_sort_rows(tok_fwd), _sort_rows(tok_rev))

    pos_vec = pos(torch.arange(3))  # (3, D)
    with_fwd = tok_fwd + pos_vec
    with_rev = tok_rev + pos_vec
    with_pos = torch.equal(_sort_rows(with_fwd), _sort_rows(with_rev))

    return without_pos, with_pos
