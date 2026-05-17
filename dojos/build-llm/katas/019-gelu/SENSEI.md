# SENSEI — gelu

## Briefing

### Goal

Implement the **tanh approximation** of GELU (Gaussian Error Linear
Unit) and verify it matches PyTorch's `nn.GELU(approximate='tanh')`.

This is the activation function GPT-2 uses inside the feed-forward
block — sandwiched between two linear layers. It is the only place a
nonlinearity enters the transformer's per-position computation.

### Tasks

1. Implement `gelu(x)` as a function:
   ```
   GELU(x) ≈ 0.5 · x · (1 + tanh( sqrt(2/π) · (x + 0.044715 · x³) ))
   ```
2. Implement `GELU` as an `nn.Module` whose `forward(x)` calls your
   function.

### Hints

- `torch.tanh`, `torch.sqrt`, `torch.pow(x, 3)` (or `x * x * x`, or
  `x ** 3`).
- `math.pi` or `torch.pi` for π. (`torch.pi` was added in 1.10.)
- Stash the constant `sqrt(2/π)` once, not on every call.
- The constant 0.044715 is empirical — Hendrycks & Gimpel curve-fit it
  to the exact GELU.

## Prerequisites

- `layer-norm` (you know `nn.Module`).

## References

- Raschka chapter 4 §4.3, Listing 4.3.
- `torch.nn.GELU` — https://docs.pytorch.org/docs/stable/generated/torch.nn.GELU.html
- Hendrycks & Gimpel (2016), "Gaussian Error Linear Units" —
  https://arxiv.org/abs/1606.08415

## Teaching Approach

Code-reading (Raschka's listing) + Socratic on the approximation.

### Socratic prompts

- "Look up `nn.GELU` in the PyTorch docs. The default is the **exact**
  GELU (uses `erf`). Why would anyone use the tanh approximation
  instead of the exact version?"
  (Speed on early GPUs without efficient `erf`; reproducibility with
  GPT-2 / BERT, which were trained with the approximation.)
- "When does the difference matter? Sketch `gelu_exact(x) - gelu_tanh(x)`
  over `x ∈ [-3, 3]`."
  (Max abs error ~0.0002 — invisible to training.)
- "ReLU is `max(0, x)`. Why isn't 'zero gradient for negative inputs'
  a big problem in practice?" (Dead ReLU problem; GELU fixes it by
  *never* having zero gradient.)
- "GELU is `x · Φ(x)` where Φ is the Gaussian CDF. What's the intuition
  for multiplying x by the probability mass below x?"
  (A soft, probabilistic gate — small/negative inputs are scaled down
  smoothly instead of clipped.)

### Common pitfalls

1. **Wrong constant** — `0.044715` is *not* `1/π` or any clean number.
   Copy it.
2. **Comparing against `nn.GELU()` default** — that's the *exact* GELU.
   You must use `nn.GELU(approximate='tanh')` for the test reference.
3. **`x.pow(3)` vs `pow(x, 3)`** — both work; `torch.pow(x, 3)` is
   explicit. `x ** 3` also works (autograd handles it).
4. **`torch.sqrt(torch.tensor(2.0 / torch.pi))` on every call** — fine
   for correctness, wasteful. Compute it once.

## On Completion

### Insight

GELU is what happens when you ask "what if ReLU had a smooth gradient
everywhere?" — and curve-fit the answer. There's no deep first-principles
derivation; Hendrycks & Gimpel tried it, it worked slightly better, and
it stuck.

This is a recurring pattern in deep learning: a small empirical win
gets locked in because everyone benchmarks against the previous SOTA,
and changing the activation breaks comparisons. GPT-2, BERT, GPT-3,
and many others use this exact function — not because it's optimal,
but because it's *the same as last time*. Llama uses SwiGLU. Both work.

### Bridge

Next: `feed-forward`. You'll sandwich your GELU between two linear
layers to build the per-position MLP that lives in every transformer
block. Why the hidden dim is 4× the model dim is the lesson.
