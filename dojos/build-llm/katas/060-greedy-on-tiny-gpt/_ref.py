"""Greedy generation on a tiny GPT.

You've already met the autoregressive loop in earlier katas (see
`002-autoregressive-generation`). This kata lifts it onto a real (but
tiny) transformer LM: the `TinyGPT` defined below.

Your job: implement `generate_greedy(model, input_ids, n_tokens)` that
runs the model `n_tokens` times, each time appending the argmax of the
last-position logits to the running sequence.

Notes:
- `input_ids` is shape (B, T) — a batch of prompts (B may be 1).
- The returned tensor is shape (B, T + n_tokens).
- Use `torch.inference_mode()` and call `model.eval()` once.
- Use `torch.argmax(..., dim=-1, keepdim=True)` so the new token tensor
  has shape (B, 1) ready for `torch.cat`.

This is the exact mechanism that powers every chat-model response you've
ever read. The rest of this chapter is about doing it faster and
formatting the inputs correctly.
"""

import torch
import torch.nn as nn


VOCAB = 50
D_MODEL = 64
N_LAYERS = 2
N_HEADS = 4
CTX_LEN = 32


class TinyGPT(nn.Module):
    """Bare-bones GPT (token emb + learned pos emb + N TransformerEncoder
    layers w/ causal mask + LM head). Provided so the kata stays focused
    on the generation loop, not the architecture."""

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
        """idx: (B, T) → logits: (B, T, vocab). Causal-masked."""
        b, t = idx.shape
        pos = torch.arange(t, device=idx.device)
        x = self.tok_emb(idx) + self.pos_emb(pos)
        mask = nn.Transformer.generate_square_subsequent_mask(t).to(idx.device)
        x = self.blocks(x, mask=mask, is_causal=True)
        return self.head(self.ln_f(x))


def generate_greedy(model: TinyGPT, input_ids: torch.Tensor,
                    n_tokens: int) -> torch.Tensor:
    """Greedy autoregressive generation.

    Args:
        model: a TinyGPT (or anything with the same (B, T) → (B, T, V)
            forward contract).
        input_ids: (B, T) prompt token IDs.
        n_tokens: how many new tokens to append.

    Returns:
        Tensor of shape (B, T + n_tokens), prompt followed by greedy
        continuation.
    """
    model.eval()
    ids = input_ids
    with torch.inference_mode():
        for _ in range(n_tokens):
            logits = model(ids)[:, -1, :]
            nxt = torch.argmax(logits, dim=-1, keepdim=True)
            ids = torch.cat([ids, nxt], dim=1)
    return ids
