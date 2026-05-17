# SENSEI — full-gpt-model

## Briefing

### Goal

Assemble the **complete GPT model**: token embedding + positional
embedding + N transformer blocks + final LayerNorm + linear output
head. Forward pass turns `(B, T)` token IDs into `(B, T, vocab_size)`
logits. Then verify the whole thing trains (one optimizer step lowers
the loss).

This is the punchline of chapter 4. After this, you have a real, tiny
language model — untrained, but architecturally complete.

### Tasks

You're given `TransformerBlock` as scaffolding (you built it in the
previous kata).

1. Implement `GPTModel(cfg)`:
   - `cfg` has: `vocab_size`, `context_length`, `emb_dim`, `n_heads`,
     `n_layers`, `drop_rate`.
   - Submodules:
     - `tok_emb = nn.Embedding(vocab_size, emb_dim)`
     - `pos_emb = nn.Embedding(context_length, emb_dim)`
     - `drop_emb = nn.Dropout(drop_rate)`
     - `trf_blocks = nn.Sequential(*[TransformerBlock(cfg) for _ in range(n_layers)])`
     - `final_norm = nn.LayerNorm(emb_dim)`
     - `out_head = nn.Linear(emb_dim, vocab_size, bias=False)`
2. In `forward(in_idx)`:
   - `tok_embeds = tok_emb(in_idx)`
   - `pos_embeds = pos_emb(torch.arange(seq_len, device=in_idx.device))`
   - Sum embeddings, apply embedding dropout, pass through blocks,
     final norm, then `out_head` → logits.
   - Returns `(B, T, vocab_size)`.

### Hints

- `pos_emb` is indexed by *position*, so its input is
  `torch.arange(T)`. Broadcasting adds it to the (B, T, D) token
  embeddings.
- Pass `in_idx.device` to `torch.arange` so positional embeddings work
  on GPU too.
- `bias=False` on `out_head` — matches GPT-2.

## Prerequisites

- All previous chapter 4 katas (layer-norm, gelu, feed-forward,
  residual-connections, transformer-block).

## References

- Raschka chapter 4 §4.6, Listing 4.7.
- Karpathy's minGPT `model.py` — https://github.com/karpathy/minGPT/blob/master/mingpt/model.py
- Raschka's `gpt.py` — https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/01_main-chapter-code/gpt.py

## Teaching Approach

Code-reading (read Raschka and minGPT side by side) + Socratic on the
output projection.

### Socratic prompts

- "Read `GPTModel.__init__` in Raschka and `GPT.__init__` in minGPT.
  What's the same? What's different? (Hint: minGPT uses LayerNorm
  *and* GELU exact, sometimes; Raschka uses tanh-GELU.) These are
  the same model up to those choices."
- "Why **two** embedding tables (tok + pos), instead of one?"
  (Decoupling. The token table is content; the position table is
  location. Adding them lets the network learn position-aware
  content. Modern variants like RoPE merge position into attention
  directly — same idea, different mechanism.)
- "The output projection is `nn.Linear(emb_dim, vocab_size)`. The
  token embedding is `nn.Embedding(vocab_size, emb_dim)`. Notice
  anything about the shapes?"
  (They're the same matrix, transposed. This is the setup for the
  next kata: **weight tying**.)
- "Count the parameters in `tok_emb`, `out_head`, and the rest. For
  tiny configs (vocab=50, d=64) the embeddings are negligible. For
  GPT-2 small (vocab=50257, d=768), they're 38M params *each* — out
  of 124M total. Why does this matter for big vocabs?"

### Common pitfalls

1. **Forgetting `torch.arange` for positions** — using `in_idx` as
   the input to `pos_emb` looks up positional embedding by token ID.
   Wrong.
2. **`pos_emb(arange(seq_len))` on CPU when `in_idx` is on GPU** —
   tensor-device mismatch. Use `device=in_idx.device`.
3. **Final norm forgotten** — without it, the activations going into
   `out_head` aren't normalized, which destabilizes training and
   diverges from GPT-2.
4. **`bias=True` on `out_head`** — GPT-2 uses `bias=False`. Test will
   pass either way, but it diverges from the spec.
5. **Indexing `pos_emb` past `context_length`** — passing a longer
   sequence than the model was configured for crashes here.

## On Completion

### Insight

About 30 lines of `nn.Module` code, and you have a transformer language
model. Read Raschka's `gpt.py` and Karpathy's minGPT `model.py` — they
are essentially the same file. This is the canonical shape of the GPT
architecture, and it has been remarkably stable since 2019: GPT-2,
GPT-3, GPT-4 (publicly assumed), Llama, Mistral, Qwen — all use this
exact structure, with tweaks (RoPE for positions, SwiGLU for FFN,
RMSNorm for normalization, grouped-query attention).

The test you just passed — "one optimizer step reduces the loss" — is
the smallest possible proof of life for a neural network. It says: the
gradients flow, the parameters move, the loss reacts. Everything else
in pretraining is scale.

### Bridge

Next: `weight-tying`. The kata description has been hinting at it: the
input embedding and the output projection have the same shape. GPT-2
*ties* these — uses the same weights for both. Llama doesn't. The
trade-off is more interesting than it looks.
