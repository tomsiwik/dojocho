# SENSEI — QKV Projections

## Briefing

### Goal

Add the three trainable linear projections — `W_q`, `W_k`, `W_v` — that
turn raw embeddings into **queries**, **keys**, and **values**. This is
where attention becomes *learnable*. You will not yet combine them into
attention; that's the next kata. Here you just build the module that
produces `(Q, K, V)` from `X`.

### Tasks

1. Implement `QKVProjection.__init__(d_in, d_out)` — three
   `nn.Linear(d_in, d_out, bias=False)` layers named exactly `W_q`,
   `W_k`, `W_v` (the tests read them by name).
2. Implement `QKVProjection.forward(x)` — given `x` of shape
   `(B, T, d_in)`, return a tuple `(Q, K, V)`, each of shape
   `(B, T, d_out)`.

### Hints

- `nn.Linear(d_in, d_out, bias=False)` is exactly the matrix `W` such
  that `linear(x) == x @ W.T`.
- The three projections are independent. Three separate `nn.Linear`
  modules, three separate calls in `forward`.
- The output is **three tensors**, not one tensor concatenated three
  ways. Tests unpack `Q, K, V = model(x)`.

## Prerequisites

- `simplified-self-attention` — you've seen what attention computes
  without weights.
- Some PyTorch: `nn.Module`, `nn.Linear`. If you've never subclassed
  `nn.Module`, see Raschka appendix A §A.5.

## References

- Raschka chapter 3 §3.4.1 — "Computing the attention weights step by
  step" (figure 3.14, the Q/K/V projection diagram).
- Raschka chapter 3 §3.4.2 listing 3.2 — `SelfAttention_v2` shows the
  exact `nn.Linear` pattern; you're implementing just the projection
  part of it.
- `nn.Linear` — https://pytorch.org/docs/stable/generated/torch.nn.Linear.html

## Teaching Approach

This is **the Socratic dialogue of the chapter.** Don't run anything
first — answer these in order.

### Socratic prompts

- "The previous kata used `x @ x.T`. The same `x` appeared on both
  sides. Is 'what this token is looking for' the same vector as 'what
  this token has to offer to be matched against'? Try the sentence
  *the quick brown fox jumps*. What is `fox` looking for? What does
  `fox` offer? Are those the same?"
- "Suppose they should be different. How many projection matrices does
  that require? Name them."
- "Now: once you've decided how much token *i* should attend to token
  *j* — what gets summed into *i*'s output? *j*'s raw embedding? Or
  something else? Why would 'something else' be useful?"
- "Three projections — query, key, value. Each one is `d_in -> d_out`.
  What does the trainable matrix in each one learn during training?
  (Hint: gradient flows from the loss; what does the gradient tell
  `W_q` to do that's different from what it tells `W_k` to do?)"
- "Why `bias=False`?" (Bias adds the same constant to every token's
  projection — it can't differentiate tokens, so it's wasted parameters
  in this position. The chapter notes this explicitly.)

### Common pitfalls

1. **Returning a stacked tensor** — `forward` should return
   `(Q, K, V)`, three separate tensors. Don't `torch.stack` them.
2. **Wrong attribute names** — the tests read `model.W_q`, `model.W_k`,
   `model.W_v`. If you name them `wq` or `query_proj`, the tests can't
   find them.
3. **Forgetting batch dim** — `nn.Linear` automatically handles a
   leading batch dimension. `Linear(d_in, d_out)(x)` works for
   `(B, T, d_in)` input directly. Don't reshape.
4. **Using `nn.Parameter(torch.rand(...))` instead of `nn.Linear`** —
   it would work mathematically, but the chapter argues for `nn.Linear`
   because of its better initialization. Use `nn.Linear`.

## On Completion

### Insight

The Q/K/V trio is **role specialization**. Every token has three jobs:
(1) advertise what it's looking for (query), (2) advertise what makes
it findable (key), (3) provide the content that gets passed on if it
*is* found (value). Three different jobs, three different linear
transforms, three different gradient signals during training.

You have no attention computation yet — just the *projections*. Look at
your `forward`: three lines, three matmuls. The next kata wires them
together into the actual attention formula:
`softmax(Q @ K.T / sqrt(d_k)) @ V`.

### Bridge

Kata `scaled-dot-product-attention` composes your `QKVProjection` with
the scaled-dot-product formula. You'll discover the scale factor by
running a numerical experiment that breaks softmax at large `d_k`.
