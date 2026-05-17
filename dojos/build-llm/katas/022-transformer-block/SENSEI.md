# SENSEI — transformer-block

## Briefing

### Goal

Assemble a complete **pre-LayerNorm** transformer block:

```
x ──┬──► LayerNorm ► Causal MHA ► Dropout ──► +x ──┬──► LayerNorm ► FFN ► Dropout ──► + ──► out
    │                                              │                                  │
    └──────────────────────────────────────────────┘──────────────────────────────────┘
```

Two sub-blocks, each wrapped in a residual connection, each preceded
by its own LayerNorm.

### Tasks

You will use a small `CausalMultiHeadAttention` that's already provided
in `solution.py` as scaffolding — you do **not** need to reimplement
it (you did that in chapter 3 katas). Your job is the assembly.

1. Implement `TransformerBlock(cfg)`:
   - `cfg` is a dict with `emb_dim`, `n_heads`, `context_length`,
     `drop_rate`.
   - Sub-modules: `att = CausalMultiHeadAttention(...)`,
     `ff = FeedForward(emb_dim)`,
     `norm1 = LayerNorm(emb_dim)`,
     `norm2 = LayerNorm(emb_dim)`,
     `drop_shortcut = nn.Dropout(drop_rate)`.
2. In `forward(x)`:
   - First sub-block: `shortcut = x`; `x = norm1(x)`;
     `x = att(x)`; `x = drop_shortcut(x)`; `x = x + shortcut`.
   - Second sub-block: same pattern with `norm2`, `ff`.
   - Return `x`.

You may use `torch.nn.LayerNorm` and `torch.nn.GELU(approximate='tanh')`
inside your `FeedForward`, or import from previous katas — either is
fine, just keep it inside this kata's file.

### Hints

- Pre-norm means LayerNorm is **inside** the sub-block, before
  attention/FFN — *not* on the residual path.
- The residual path is pure identity. Don't normalize it, don't
  dropout it, don't dropout-then-add — add first, dropout after the
  block.
- Shape in == shape out: `(B, T, emb_dim)`.

## Prerequisites

- `layer-norm`, `gelu`, `feed-forward`, `residual-connections`.
- Chapter 3 attention katas (you know what causal MHA does).

## References

- Raschka chapter 4 §4.5, Listing 4.6.
- Xiong et al. (2020), "On Layer Normalization in the Transformer
  Architecture" — https://arxiv.org/abs/2002.04745 (the pre-norm
  vs post-norm paper).

## Teaching Approach

Use-Modify-Create. The causal MHA is given (use); the assembly is yours
(create); the order of operations is the lesson (modify, in your head).

### Socratic prompts

- "The original Transformer paper (Vaswani 2017) used **post-norm**:
  `x = LayerNorm(x + sublayer(x))`. GPT-2, Llama, every modern model
  uses **pre-norm**: `x = x + sublayer(LayerNorm(x))`. They're
  mathematically different. Both work. What does that say about
  how we know which architecture is 'right'?"
- "Trace one residual path through a 12-block pre-norm model. From
  input to output, how many LayerNorms does the residual signal pass
  through?" (Zero! The residual is pure identity all the way through.
  That's the gradient highway.)
- "What would happen if you put the LayerNorm *after* the residual add,
  on the residual path?" (Each LayerNorm rescales the residual; deep
  stacks become unstable in training. This is the post-norm failure
  mode.)
- "Why dropout *after* attention/FFN, not before the residual add?"
  (You want the residual path uncorrupted by noise; you regularize the
  perturbation, not the identity.)

### Common pitfalls

1. **Adding `shortcut` before LayerNorm** — `x = norm1(x + shortcut)`
   is post-norm. Pre-norm: `x = norm1(x); x = att(x); x = x +
   shortcut`.
2. **Sharing `norm1` and `norm2`** — they're separate `LayerNorm`
   modules with separate learned parameters. Don't reuse one instance.
3. **Dropout on the residual path** — `x = drop(x); x = x + shortcut`
   is fine, but `shortcut = drop(shortcut)` corrupts the identity.
4. **Forgetting that MHA needs causality** — for autoregressive
   training, the attention must mask future positions. The provided
   `CausalMultiHeadAttention` does this; if you swap in your own, make
   sure it does too.

## On Completion

### Insight

You now have *the* atomic unit of GPT. Stack N of these (with token
embeddings on one end and an output head on the other), and you have a
language model. GPT-2 small stacks 12. GPT-2 XL stacks 48. GPT-3 stacks
96. Llama-3-70B stacks 80. The block doesn't change.

The two compositions — pre-norm and post-norm — are a perfect example
of an architectural choice that wasn't theory-driven but
empirically-driven. The 2020 paper that explained why pre-norm trains
more stably came *years* after everyone had already switched.

### Bridge

Next: `full-gpt-model`. You'll wrap N copies of this block with token
embeddings, positional embeddings, a final LayerNorm, and an output
projection. The result is `forward(token_ids) → logits`. A real
language model — small, untrained, but real.
