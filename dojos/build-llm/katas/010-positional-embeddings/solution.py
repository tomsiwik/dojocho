"""positional-embeddings — Telling the model where each token is

In the previous kata you proved that nn.Embedding is position-blind:
the id determines the vector, end of story. Concatenate ["dog",
"bites", "man"] or ["man", "bites", "dog"], you get the SAME set of
embedding vectors — just in a different order in the (B, T, D) tensor.

But attention (chapter 3 preview) is *also* nearly position-blind: it
computes weighted sums of value vectors, and a sum doesn't care about
order. So if the token embeddings carry no positional information, the
model has no way to distinguish "dog bites man" from "man bites dog."

GPT-2's fix is the simplest imaginable: a SECOND embedding layer
indexed by *position* (0, 1, 2, ..., context_length-1), produces
(T, D) vectors, and is ADDED to the token embeddings. The model
learns the positional vectors alongside the token vectors.

The math is one line:
    input_emb[b, t] = token_emb[b, t] + pos_emb[t]

The shape verification is two lines.

Tasks
-----
1. `make_positional_embedding(context_length, d_model, seed=0)` —
   `nn.Embedding(context_length, d_model)` with reproducible init.

2. `position_ids(T, device=None)` — return `torch.arange(T)` (on
   `device` if given). These are the inputs to the positional
   embedding layer.

3. `add_positional(token_emb, pos_emb_layer)` — given token embeddings
   of shape (B, T, D), apply the positional embedding to a
   `torch.arange(T)` and ADD to token_emb. Returns (B, T, D).
   Broadcasting does the work: (B, T, D) + (T, D) → (B, T, D).

4. `forward_input_pipeline(ids, vocab_size, d_model, context_length,
   seed=0)` — full pipeline:
     a) build token embedding
     b) build positional embedding
     c) lookup token embeddings for `ids` of shape (B, T)
     d) add positional embeddings
     e) return (B, T, d_model) tensor

5. `demonstrate_position_blindness(vocab_size, d_model, seed=0)` —
   return a tuple `(without_pos, with_pos)` of bools:
   - `without_pos`: are bare token embeddings the SAME (up to a
     reorder) for the sentences `[1, 2, 3]` and `[3, 2, 1]`? Use
     `torch.equal(sort_rows(a), sort_rows(b))` where sort_rows sorts
     the (T, D) matrix by its first column. True means yes,
     position-blind.
   - `with_pos`: after adding positional embeddings (with
     context_length=3), is the same equality still true?
"""

import torch
import torch.nn as nn


def make_positional_embedding(
    context_length: int, d_model: int, seed: int = 0
) -> nn.Embedding:
    """Reproducible nn.Embedding for positions 0..context_length-1."""
    ...  # implement me


def position_ids(T: int, device: torch.device | None = None) -> torch.Tensor:
    """torch.arange(T), optionally on a given device."""
    ...  # implement me


def add_positional(
    token_emb: torch.Tensor, pos_emb_layer: nn.Embedding
) -> torch.Tensor:
    """token_emb is (B, T, D). Compute pos_emb of shape (T, D) and add.

    Returns (B, T, D).
    """
    ...  # implement me


def forward_input_pipeline(
    ids: torch.Tensor,
    vocab_size: int,
    d_model: int,
    context_length: int,
    seed: int = 0,
) -> torch.Tensor:
    """Full chapter-2 input pipeline: ids -> token_emb -> +pos_emb."""
    ...  # implement me


def demonstrate_position_blindness(
    vocab_size: int, d_model: int, seed: int = 0
) -> tuple[bool, bool]:
    """Return (without_pos, with_pos) — whether the set of vectors is
    invariant to a sequence reversal.

    without_pos should be True (token embeddings are position-blind).
    with_pos should be False (positional embeddings break the symmetry).
    """
    ...  # implement me
