# SENSEI — tiny-qwen-block

## Briefing

### Goal

Assemble the four pieces from the previous katas (RMSNorm, RoPE, GQA,
SwiGLU) into a single Qwen3-style transformer block. The block itself
is mechanical wiring — the *integration* is the lesson. Stack 28 of
these, add an embedding and an output head, and you have the Qwen3 0.6B
model from appendix C.

### Structure (pre-norm, two residuals)

```
x_in
  │
  ├──────────────────────────────┐
  ▼                              │ (residual)
RMSNorm                          │
  │                              │
  ▼                              │
GQA (with RoPE on Q,K)           │
  │                              │
  ▼                              │
  + ◄───────────────────────────┘
  │
  ├──────────────────────────────┐
  ▼                              │ (residual)
RMSNorm                          │
  │                              │
  ▼                              │
SwiGLU                           │
  │                              │
  ▼                              │
  + ◄───────────────────────────┘
  │
x_out
```

### Tasks

Implement `TinyQwenBlock(d_model, n_q_heads, n_kv_heads, d_ff, max_seq_len, rope_base=10000.0)`
as an `nn.Module`:

1. In `__init__`:
   - `norm1 = RMSNorm(d_model)`
   - `attn = GQAWithRoPE(d_model, n_q_heads, n_kv_heads, max_seq_len, rope_base)`
     (a thin GQA variant that applies RoPE inside `forward`; provided as
     a helper in `solution.py`).
   - `norm2 = RMSNorm(d_model)`
   - `ffn = SwiGLU(d_model, d_ff)`
2. In `forward(x)`:
   - `x = x + self.attn(self.norm1(x))`
   - `x = x + self.ffn(self.norm2(x))`
   - `return x`

The four building blocks (`RMSNorm`, `precompute_rope_freqs`,
`apply_rope`, `GQAWithRoPE`, `SwiGLU`) are **provided** at the top of
`solution.py`. Your job is the four-line wiring.

### Hints

- *Pre-norm*: RMSNorm comes before attention/FFN, not after. (GPT-2 was
  post-norm; modern LLMs are universally pre-norm because it trains
  deeper stacks without divergence.)
- Two residual adds, one per sub-block. Don't forget either.
- `attn` takes a single tensor and returns a single tensor (the RoPE
  table is precomputed inside the GQA helper). Same for `ffn`.

## Prerequisites

- `rms-norm`, `rotary-positional-embeddings`, `grouped-query-attention`,
  `swiglu-ffn` — all four. Do them first.

## References

- Raschka *Build a Reasoning Model from Scratch*, Appendix C §C.5, Listing C.5.
- Xiong et al. (2020), "On Layer Normalization in the Transformer
  Architecture" (pre-norm vs post-norm) — https://arxiv.org/abs/2002.04745

## Teaching Approach

Use-Modify-Create. The four primitives are provided; you wire them.
After it passes, *modify* one piece at a time (swap pre-norm for
post-norm, swap SwiGLU for classical FFN, etc.) and watch how the
training-step test breaks.

### Socratic prompts

- "Two residual connections, two RMSNorms. What would break if you
  collapsed them into one shared norm before both sub-blocks?" (You'd
  lose the *independent* re-scaling each sub-block needs. The norm
  before FFN sees the post-attention activations, which have a
  different scale than the input.)
- "Pre-norm vs post-norm: in pre-norm the residual path is a clean
  identity from input to output (no norm on it). What does that buy
  you?" (Gradient flow at depth — no normalization compresses the
  residual gradient at every layer. Pre-norm transformers train
  stably to 100+ layers; post-norm caps out around 12 without warmup
  tricks.)
- "Where does RoPE get applied in your wiring?" (Inside `attn`. Q and K
  get rotated *after* projection, *before* the softmax. The block
  itself doesn't even see RoPE — it's an attention internal.)
- After the training-step test passes: "One optimizer step reduced the
  loss. What did the model just *learn*? Anything? Or just memorized
  the random target a tiny bit?" (The latter — but it's evidence the
  block is differentiable end-to-end, which is the only thing that
  matters here.)

### Common pitfalls

1. **Forgetting a residual** — output shape will be right, training
   step might even pass on a tiny example. Look at your code: two
   `x = x + ...` lines. Both required.
2. **Norm in the wrong place** — `RMSNorm(attn(x))` instead of
   `attn(RMSNorm(x))` is post-norm. The wiring above is pre-norm.
3. **Mismatched dims** — `d_model` flows through both sub-blocks
   untouched; `d_ff` only lives inside SwiGLU; `head_dim = d_model // n_q_heads`
   lives only inside GQA.
4. **Not calling `.train()` before the training-step test** — usually
   harmless here (no dropout), but a good habit.

## On Completion

### Insight

You just wrote the central unit of a modern LLM. Qwen3 0.6B stacks 28
of these blocks; Llama 3 70B stacks 80. The block is genuinely the
same — wider (`d_model=8192`), more heads (`n_q_heads=64`,
`n_kv_heads=8`), longer context (`max_seq_len=131072` with rope scaling)
— but structurally identical to what you just wrote. The thing that
makes those frontier models capable isn't a different architecture; it's
that they were trained on trillions of tokens for millions of GPU-hours.

You've finished appendix C. The Qwen3 architecture is, in your head,
done.

### Bridge

The dojo continues into appendix D (using larger LLMs — loading
pre-trained weights into the architecture you just built) and the rest
of the *build-reasoning* material (chapters on reasoning techniques
built on top of this base).
