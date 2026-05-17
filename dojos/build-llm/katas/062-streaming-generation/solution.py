"""Streaming generation.

`generate_greedy` (previous kata) collects every new token into a tensor
and returns the full sequence at the end. That's fine for batch jobs
but **terrible UX** for a chat interface: the user waits N tokens worth
of compute (potentially seconds) and then the whole response appears.

`stream_generate` does the same compute, but `yield`s each token as
soon as it's produced. The client sees the first character as soon as
the first forward pass finishes — even though the *total* time to
complete is identical.

Spec:
    stream_generate(model, input_ids, n_tokens) -> Iterator[int]

Yields **exactly `n_tokens` integers**, in order. Each integer is the
next greedily-selected token ID (for batch size 1; the test uses B=1).

Notes:
- This is a generator function (uses `yield`). Calling it does NOT run
  the loop; iterating the result does.
- Sum check: collecting the iterator and appending to the prompt must
  reproduce the output of `generate_greedy`. That's the contract.
"""

from typing import Iterator

import torch
import torch.nn as nn


VOCAB = 50
D_MODEL = 64
N_LAYERS = 2
N_HEADS = 4
CTX_LEN = 32


class TinyGPT(nn.Module):
    """Same TinyGPT as the previous kata — see greedy-on-tiny-gpt for
    architecture notes."""

    def __init__(self, vocab=VOCAB, d_model=D_MODEL, n_layers=N_LAYERS,
                 n_heads=N_HEADS, ctx_len=CTX_LEN):
        super().__init__()
        self.ctx_len = ctx_len
        self.tok_emb = nn.Embedding(vocab, d_model)
        self.pos_emb = nn.Embedding(ctx_len, d_model)
        layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads, dim_feedforward=4 * d_model,
            batch_first=True, dropout=0.0, activation="gelu",
        )
        self.blocks = nn.TransformerEncoder(layer, num_layers=n_layers)
        self.ln_f = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab, bias=False)

    def forward(self, idx: torch.Tensor) -> torch.Tensor:
        b, t = idx.shape
        pos = torch.arange(t, device=idx.device)
        x = self.tok_emb(idx) + self.pos_emb(pos)
        mask = nn.Transformer.generate_square_subsequent_mask(t).to(idx.device)
        x = self.blocks(x, mask=mask, is_causal=True)
        return self.head(self.ln_f(x))


def stream_generate(model: TinyGPT, input_ids: torch.Tensor,
                    n_tokens: int) -> Iterator[int]:
    """Yield greedy next tokens, one int at a time.

    Args:
        model: TinyGPT (or any (B, T) -> (B, T, V) module).
        input_ids: (1, T) prompt token IDs. Batch size is 1.
        n_tokens: how many tokens to yield.

    Yields:
        Each greedily-selected next token ID as a Python int.
    """
    ...  # implement me
