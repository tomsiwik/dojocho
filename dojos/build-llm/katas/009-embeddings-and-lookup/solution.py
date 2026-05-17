"""embeddings-and-lookup — nn.Embedding is just a row lookup

This kata is small but the *insight* is one of the most important in
the book. By the end you should be able to explain, without notes:

    "nn.Embedding(V, D) is mathematically equivalent to multiplying
    a one-hot vector of dim V by a learned matrix W of shape (V, D).
    It is implemented as a row-select for efficiency."

You won't take the claim on faith. You'll *prove it* by implementing
both versions and asserting they produce identical tensors.

The setup
---------
- Vocabulary: 8 tokens. ids 0..7.
- Embedding dim: 4. So W has shape (8, 4).
- A batch of (B=2, T=3) token ids.

`nn.Embedding(8, 4)(ids)` returns shape (2, 3, 4).

You will:
  - implement `embed_via_lookup(ids, embedding)` — the standard way
    (just `embedding(ids)`).
  - implement `embed_via_onehot_matmul(ids, embedding)` — build a
    one-hot tensor of shape (2, 3, 8), then matmul with
    `embedding.weight` of shape (8, 4) to get (2, 3, 4).
  - prove the two produce identical tensors.

Tasks
-----
1. `make_embedding(vocab_size, d_model, seed=0)` — instantiate an
   `nn.Embedding(vocab_size, d_model)` with `torch.manual_seed(seed)`
   set immediately before, so tests reproduce.

2. `embed_via_lookup(ids, embedding)` — call the embedding layer.
   `ids` has shape (B, T), result shape (B, T, d_model).

3. `embed_via_onehot_matmul(ids, embedding)` — same result, computed
   via one-hot @ embedding.weight. Hints:
   - `torch.nn.functional.one_hot(ids, num_classes=V)` returns long
     ints; cast to `.float()` before matmul.
   - The matmul: `one_hot.float() @ embedding.weight`.

4. `embed_batch(ids, vocab_size, d_model, seed=0)` — convenience:
   build embedding, lookup, return shape (B, T, d_model). Used to
   verify the final shape contract.
"""

import torch
import torch.nn as nn


def make_embedding(vocab_size: int, d_model: int, seed: int = 0) -> nn.Embedding:
    """Create an nn.Embedding with reproducible init."""
    ...  # implement me


def embed_via_lookup(ids: torch.Tensor, embedding: nn.Embedding) -> torch.Tensor:
    """Standard: just call the embedding layer."""
    ...  # implement me


def embed_via_onehot_matmul(
    ids: torch.Tensor, embedding: nn.Embedding
) -> torch.Tensor:
    """Equivalent: one-hot encode ids, then matmul with embedding.weight."""
    ...  # implement me


def embed_batch(
    ids: torch.Tensor, vocab_size: int, d_model: int, seed: int = 0
) -> torch.Tensor:
    """Build an embedding and return embed_via_lookup(ids, ...)."""
    ...  # implement me
