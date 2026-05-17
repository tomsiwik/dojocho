# SENSEI — feed-forward

## Briefing

### Goal

Implement the per-position **FeedForward** block: a tiny MLP that
expands to 4× the model dimension, applies GELU, then contracts back.
This is the "wide-then-narrow" sandwich that lives in every transformer
block, applied identically to every token.

### Tasks

1. Implement `FeedForward(emb_dim)` as an `nn.Module`:
   - `nn.Linear(emb_dim, 4 * emb_dim)`
   - `GELU()` (use `torch.nn.GELU(approximate='tanh')` — or your own
     from the `gelu` kata).
   - `nn.Linear(4 * emb_dim, emb_dim)`
2. `forward(x)` passes `x` through the three layers in order. Input
   and output shape must be identical (`(..., emb_dim)`).

### Hints

- `nn.Sequential` is the cleanest way to chain three layers.
- The expansion factor is `4` — hard-code it, or read it from `cfg`
  if you like. Raschka uses 4 in `GPT_CONFIG_124M`.
- Don't put a nonlinearity after the second linear — the residual
  add comes next (in the transformer block) and adding a nonlinearity
  before the residual breaks the gradient highway.

## Prerequisites

- `gelu` (you have a working GELU).
- `layer-norm` (you've built an `nn.Module`).

## References

- Raschka chapter 4 §4.3, Listing 4.4.
- Vaswani et al. (2017), "Attention Is All You Need", §3.3 (the
  position-wise FFN definition) — https://arxiv.org/abs/1706.03762

## Teaching Approach

Kata + Socratic on the 4× factor (there is no rigorous answer, and
THAT is the lesson).

### Socratic prompts

- "Why 4? Where does that come from?"
  (Vaswani et al. used `d_ff = 2048` with `d_model = 512` — a 4× ratio.
  No first-principles derivation; it worked. Everyone copied it.)
- "What if you used 2× instead of 4×? 8×? What's the trade-off?"
  (Compute and parameter count scale linearly with the factor;
  capacity scales sub-linearly. 4× is roughly the sweet spot in
  practice for dense FFNs. Llama-style SwiGLU FFNs use 8/3 because
  the gate adds a third matrix.)
- "The FFN is applied identically and *independently* to each token
  position. Attention mixes information across positions; the FFN
  does not. What does the FFN contribute that attention can't?"
  (Per-token nonlinear feature transformation. Without it, the
  network is a stack of (linear in features) * (linear mix across
  tokens) — collapses to a single linear map per pair.)
- "Roughly what fraction of GPT-2's parameters live in FFNs?"
  (About 2/3. For each block: attention is ~4·d² params; FFN is
  ~8·d² params. Worth knowing before you optimize the wrong thing.)

### Common pitfalls

1. **Forgetting the activation** — a Linear → Linear sandwich with no
   nonlinearity collapses to a single Linear. The whole point is the
   GELU in the middle.
2. **Putting an activation after the second linear** — breaks residual
   connections in the transformer block. The FFN output must be a
   raw, signed tensor.
3. **Hidden dim = emb_dim** — common typo. The hidden dim must be
   *bigger* than emb_dim, or there's no representational widening.
4. **Bias=False** — Raschka's GPT uses bias=True in the FFN linears
   (default), unlike the QKV projections. Don't disable it.

## On Completion

### Insight

The FFN is conceptually the simplest piece of a transformer — just a
two-layer MLP per token — but it holds the majority of the parameters.
This is the unglamorous workhorse: attention gets the attention
(literally), but most of what the network *knows* is stored in these
two matrices per layer.

The "4× and that's it" choice is a useful reminder that not every
hyperparameter in a winning architecture is principled. Some are
inherited. When you're tempted to derive everything from first
principles, remember: 4 is just 4.

### Bridge

Next: `residual-connections`. You'll see what happens to gradients in
a 12-layer MLP with and without residuals. The demo is dramatic — and
it's the reason the transformer block has the structure it does.
