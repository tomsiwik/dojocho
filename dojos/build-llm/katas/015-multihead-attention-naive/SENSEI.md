# SENSEI — Multi-Head Attention (Naive)

## Briefing

### Goal

Run causal self-attention **N times in parallel** with N different
trainable projection trios, then concatenate the per-head outputs along
the feature axis. This is the *intuitive* version of multi-head
attention — a wrapper around N single-head modules. It is slow but
unambiguous, and the chapter introduces it first for exactly that
reason (Raschka §3.6.1, listing 3.4).

### Tasks

1. Implement `MultiHeadAttentionNaive(d_in, d_out, context_length,
   num_heads)`:
   - Hold `num_heads` independent `CausalHead` modules in an
     `nn.ModuleList` named exactly `heads`.
   - Each head has its own `W_q`, `W_k`, `W_v` (no bias) — so each
     head learns its own notion of similarity.
   - Each head's output is shape `(B, T, d_out)`.
   - `forward(x)` concatenates head outputs along the last axis →
     final shape `(B, T, num_heads * d_out)`.

2. Implement `CausalHead(d_in, d_out, context_length)` — a single
   causal self-attention head. Same shape contract as the previous
   kata's `CausalAttention`. (You may copy/adapt that code; this kata
   tests it again here so each kata is self-contained.)

### Hints

- `nn.ModuleList([CausalHead(...) for _ in range(num_heads)])`.
- `torch.cat([h(x) for h in self.heads], dim=-1)` is the entire
  `forward`.
- The output dimension is `num_heads * d_out`, **not** `d_out`. The
  chapter calls this out at the end of §3.6.1 (figure 3.25).

## Prerequisites

- `causal-attention-mask` — `CausalHead` is essentially that kata's
  module under a new name.

## References

- Raschka chapter 3 §3.6.1, listing 3.4 — `MultiHeadAttentionWrapper`
  is the reference implementation.
- `nn.ModuleList` — https://pytorch.org/docs/stable/generated/torch.nn.ModuleList.html
- `torch.cat` — https://pytorch.org/docs/stable/generated/torch.cat.html

## Teaching Approach

**Use-Modify-Create.** You already have `CausalAttention` from the
previous kata; the *use* is to wrap N of those, the *modify* is the
output dim. Almost no new ideas here — this kata is about the *shape*
of multi-head before we get clever about it.

### Socratic prompts

- "Why do we need multiple heads at all? What can two heads learn that
  one head can't?" (Different similarity functions: head 1 might
  attend to syntactic neighbors, head 2 to topical anchors, head 3 to
  positional patterns. One head averages all of these into one set of
  weights; many heads keep them disentangled.)
- "Each head has its own W_q, W_k, W_v. Why isn't sharing one set
  across heads enough?" (Then every head would compute the same
  attention pattern — identical weights, identical output. The whole
  point is each head trains its projections independently.)
- "The output is shape `(B, T, num_heads * d_out)`. The input was
  `(B, T, d_in)`. Why is the model OK with the feature axis growing?"
  (It isn't, long-term — downstream layers expect a fixed dim. The
  *efficient* version solves this by making each head's `d_out` smaller
  so they concatenate back to `d_in`. You'll see this next kata.)
- "Time the forward pass for `num_heads=8` and compare to a single head
  with `d_out` 8× larger. Where does the time go?" (Eight independent
  Python-level matmuls, no GPU parallelism between heads.)

### Common pitfalls

1. **Using a plain Python list** — `[CausalHead(...) for _ in ...]`
   does not register the heads as submodules. `m.parameters()` returns
   nothing and `.to(device)` doesn't move them. Use `nn.ModuleList`.
2. **Concatenating along the wrong axis** — `dim=0` (batch) and
   `dim=1` (tokens) are both wrong; the heads share batch and token
   axes. `dim=-1` (features).
3. **Reusing one set of W_q/W_k/W_v across heads** — defeats the
   purpose. Each head must own its own.

## On Completion

### Insight

Multi-head attention is **N parallel single-head attentions**.
Conceptually that's the whole story. The naive implementation makes
that crystal clear: `ModuleList` + `torch.cat`. The next kata achieves
the same function with a single fused matmul instead of N separate
ones — same math, ~N× faster on a GPU.

### Bridge

Kata `multihead-attention-efficient` rewrites this with `.view` and
`.transpose` to do all N heads in one fused matmul. The new syntax is
the unfamiliar part — the math is identical. You'll Parsons-puzzle the
reshape sequence to make sure each step is justified.
