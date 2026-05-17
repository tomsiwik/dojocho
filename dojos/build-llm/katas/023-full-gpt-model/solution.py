"""full-gpt-model — Assemble the complete GPT model.

token embedding + positional embedding + N transformer blocks +
final LayerNorm + lm_head Linear.

Forward: (B, T) token IDs → (B, T, vocab_size) logits.

TransformerBlock + supporting modules are provided as scaffolding so
this kata stays focused on the top-level assembly and the embedding
layers.
"""

import torch
import torch.nn as nn


# ----- Provided scaffolding (built in previous katas) -----

class CausalMultiHeadAttention(nn.Module):
    def __init__(self, d_in, d_out, context_length, num_heads, dropout=0.0, qkv_bias=False):
        super().__init__()
        assert d_out % num_heads == 0
        self.d_out = d_out
        self.num_heads = num_heads
        self.head_dim = d_out // num_heads
        self.W_q = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_k = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.W_v = nn.Linear(d_in, d_out, bias=qkv_bias)
        self.out_proj = nn.Linear(d_out, d_out)
        self.dropout = nn.Dropout(dropout)
        self.register_buffer(
            "mask",
            torch.triu(torch.ones(context_length, context_length), diagonal=1).bool(),
        )

    def forward(self, x):
        b, t, _ = x.shape
        q = self.W_q(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.W_k(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.W_v(x).view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        scores = q @ k.transpose(-2, -1) / (self.head_dim ** 0.5)
        scores = scores.masked_fill(self.mask[:t, :t], float("-inf"))
        attn = torch.softmax(scores, dim=-1)
        attn = self.dropout(attn)
        out = (attn @ v).transpose(1, 2).contiguous().view(b, t, self.d_out)
        return self.out_proj(out)


class FeedForward(nn.Module):
    def __init__(self, emb_dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(emb_dim, 4 * emb_dim),
            nn.GELU(approximate="tanh"),
            nn.Linear(4 * emb_dim, emb_dim),
        )

    def forward(self, x):
        return self.layers(x)


class TransformerBlock(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.att = CausalMultiHeadAttention(
            d_in=cfg["emb_dim"],
            d_out=cfg["emb_dim"],
            context_length=cfg["context_length"],
            num_heads=cfg["n_heads"],
            dropout=cfg["drop_rate"],
        )
        self.ff = FeedForward(cfg["emb_dim"])
        self.norm1 = nn.LayerNorm(cfg["emb_dim"])
        self.norm2 = nn.LayerNorm(cfg["emb_dim"])
        self.drop_shortcut = nn.Dropout(cfg["drop_rate"])

    def forward(self, x):
        shortcut = x
        x = self.norm1(x)
        x = self.att(x)
        x = self.drop_shortcut(x)
        x = x + shortcut

        shortcut = x
        x = self.norm2(x)
        x = self.ff(x)
        x = self.drop_shortcut(x)
        x = x + shortcut
        return x


# ----- Your code goes below -----

class GPTModel(nn.Module):
    """Full GPT model.

    Args:
        cfg: dict with keys vocab_size, context_length, emb_dim,
             n_heads, n_layers, drop_rate.
    """

    def __init__(self, cfg: dict):
        super().__init__()
        ...  # implement me — tok_emb, pos_emb, drop_emb, trf_blocks,
             # final_norm, out_head

    def forward(self, in_idx: torch.Tensor) -> torch.Tensor:
        """(B, T) token IDs → (B, T, vocab_size) logits."""
        ...  # implement me
