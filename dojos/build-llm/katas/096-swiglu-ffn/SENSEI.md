# SENSEI — swiglu-ffn

## Briefing

### Goal

Implement the SwiGLU feed-forward block used in Qwen3, Llama, and most
modern LLMs. Classical FFN has two linear layers and one activation;
SwiGLU has *three* linears and combines two of them multiplicatively
through a SiLU gate. At equal parameter budget, the gated variant
outperforms the classical one.

### Tasks

Implement `SwiGLU(d_model, d_ff)` as an `nn.Module`:

1. In `__init__`, create three linear projections (all `bias=False`):
   - `W_gate`: `d_model → d_ff`
   - `W_up`:   `d_model → d_ff`
   - `W_down`: `d_ff → d_model`
2. In `forward(x)` for `x.shape == (..., d_model)`:
   - Compute `gate = W_gate(x)` and `up = W_up(x)`, each `(..., d_ff)`.
   - Apply SiLU to the **gate** (NOT to `up`).
   - Element-wise multiply: `hidden = silu(gate) * up`.
   - Project down: `return W_down(hidden)`.

### Hints

- `torch.nn.functional.silu(x)` is `x * sigmoid(x)` in one fused op.
  Also called *Swish*; same function, two names.
- Order matters numerically but not semantically: in the original Qwen3
  code (listing C.2) it's `silu(fc1(x)) * fc2(x)`. Pick a convention and
  document it.
- All three linears are `bias=False` in modern LLMs.

## Prerequisites

- `feed-forward` and `gelu` katas (classical FFN + smooth activation).
- `nn.Module`, `nn.Linear`.

## References

- Raschka *Build a Reasoning Model from Scratch*, Appendix C §C.2, Listing C.2.
- Shazeer (2020), "GLU Variants Improve Transformer" — https://arxiv.org/abs/2002.05202
- `torch.nn.functional.silu` — https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.silu.html

## Teaching Approach

Code-reading + Socratic. The block is six lines; the lesson is in the
*why three linears beat two*.

### Socratic prompts

- "Classical FFN: `down(activation(up(x)))` — 2 linears. SwiGLU: 3
  linears. If we hold the total parameter budget constant, what has to
  change in the intermediate dim `d_ff`?" (It shrinks — concretely, by
  ~1/3 in Qwen3 0.6B: the classical FFN at `d_ff = 8*d_model/3` and the
  SwiGLU at `d_ff = 8*d_model/3` *both* use ~the same params, because
  SwiGLU's three linears at that width equal the classical's two at
  `2 × that` width.)
- "What does `silu(gate) * up` give you that `silu(up)` doesn't?"
  (Multiplicative interaction between two different projections of the
  same input. Each element of `up` is dynamically gated by a learned
  function of `x`. This is *content-dependent feature selection*.)
- "Why SiLU instead of GELU?" (Marginally cheaper to compute; near
  identical quality. SiLU is `x * sigmoid(x)` — one sigmoid call, no
  CDF approximation. GPU kernel writers prefer it.)
- "Why no bias?" (Tiny effect on capacity, real effect on memory
  bandwidth at scale, and the model can recover the bias through the
  next RMSNorm + linear if it really needs to.)
- "Where in the transformer block does this sit?" (After the residual
  add from attention, after RMSNorm. One per block.)

### Common pitfalls

1. **Applying SiLU to both `gate` and `up`** — only `gate` gets SiLU. If
   you SiLU both, you've changed the function. Tests will catch this
   via the element-wise gating check.
2. **`bias=True`** — every modern LLM uses `bias=False` here. The
   parameter-count test assumes it.
3. **Wrong intermediate shape** — `W_up` and `W_gate` must produce the
   *same* shape `(..., d_ff)` so they can multiply element-wise.
4. **Confusing SwiGLU with GeGLU** — same architecture, GeGLU uses GELU
   instead of SiLU. Either works; SwiGLU is the modern default.

## On Completion

### Insight

The "gated" idea is older than transformers (LSTMs gate everything).
What Shazeer's 2020 paper showed is that a *single* GLU-style gate in
the FFN block measurably improves perplexity at zero parameter cost.
Six lines, no exotic math, no extra hyperparameters — and it shipped in
every flagship open-weight LLM that followed. Sometimes the lesson is
that a good idea looks unimpressive.

### Bridge

Final kata of this appendix: `tiny-qwen-block` assembles RMSNorm,
RoPE, GQA, and SwiGLU into one transformer block — the unit that Qwen3
stacks 28 times to make a real LLM. The block itself is mechanical; the
*integration* is the lesson.
