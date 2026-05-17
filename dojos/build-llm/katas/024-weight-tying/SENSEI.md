# SENSEI — weight-tying

## Briefing

### Goal

Make the **input token embedding** and the **output language-model
head** share the same weight tensor. Verify they share storage (same
`data_ptr()`), and verify that updating either updates both.

This single trick removed ~38M parameters from GPT-2 small (out of
124M) — about 30% of the model. It was used in GPT-1 and GPT-2; Llama
and most modern open-source models *don't* use it. The decision has a
real trade-off.

### Tasks

You're given the same `GPTModel` scaffolding as the previous kata.

1. Implement `tie_weights(model)`:
   - Set `model.out_head.weight = model.tok_emb.weight`.
   - That's the whole trick. `nn.Embedding.weight` is `(vocab, d)`
     and `nn.Linear(d, vocab).weight` is `(vocab, d)` — same shape,
     no transpose needed (PyTorch's `Linear` stores its weight as
     `(out, in)` and computes `x @ W.T`).
2. The function should return the model (so it composes nicely).

### Hints

- After `tie_weights(model)`, `model.tok_emb.weight is
  model.out_head.weight` is True. Same Python object. Same
  `.data_ptr()`.
- You're replacing the `nn.Parameter` on `out_head`, not just copying
  values. Use direct assignment to `.weight`.
- `out_head` must have `bias=False` for this to make sense (the embedding
  has no bias to share). The provided model already does this.
- `sum(p.numel() for p in model.parameters())` will *drop* by
  vocab*emb_dim after tying — because the duplicate parameter is
  deduplicated when iterating.

## Prerequisites

- `full-gpt-model` (you have the architecture).

## References

- Raschka chapter 4 §4.6, "weight tying" discussion.
- Press & Wolf (2016), "Using the Output Embedding to Improve Language
  Models" — https://arxiv.org/abs/1608.05859 (the original tied-embedding
  paper).
- Inan et al. (2016), "Tying Word Vectors and Word Classifiers" —
  https://arxiv.org/abs/1611.01462

## Teaching Approach

Socratic from observation. The student noticed the shape coincidence
in the previous kata; now they tie the knot and reason about why
modern models *un*-tie it.

### Socratic prompts

- "Print `model.tok_emb.weight.shape` and `model.out_head.weight.shape`
  before tying. They're identical. What does that imply about whether
  these layers are 'doing the same thing'?"
  (Both are maps between vocab indices and d-dimensional vectors —
  one direction in, one direction out. Tying says: use the same
  vocabulary geometry for both.)
- "GPT-2 small has 124M parameters with tying, 163M without (the
  38M difference is exactly vocab_size × emb_dim = 50257 × 768).
  Why would Llama-3-70B (~70B params) choose NOT to save 38M params
  by tying? What does it gain?"
  (Capacity. The unembed matrix doesn't have to encode the same thing
  as the embed matrix; allowing them to diverge gives the model more
  flexibility for next-token prediction. For huge models, 38M is noise;
  the capacity gain is worth it.)
- "Press & Wolf showed tying *improves* validation perplexity in
  small/medium models. Why might this be? What's the inductive bias?"
  (Forces the model to learn a single 'word vector space' that's used
  consistently for input and output. Acts as regularization at small
  scale. At very large scale, you have enough data to learn good
  unembedding directly, and the regularization helps less than the
  added capacity hurts.)
- "After tying, when you compute gradients for `out_head.weight`,
  what happens to `tok_emb.weight`?" (Same tensor — gradients
  accumulate from both the embedding lookup and the output projection.
  Both contribute to the update.)

### Common pitfalls

1. **Copying values instead of sharing the parameter** —
   `out_head.weight.data.copy_(tok_emb.weight.data)` makes the values
   equal *now* but they diverge after the first optimizer step. You
   must share the `nn.Parameter` object.
2. **Transposing** — `out_head.weight = tok_emb.weight.T` will break
   `Linear.forward` (wrong shape) and detach autograd. PyTorch handles
   the transpose internally; share the parameter as-is.
3. **`out_head` with bias** — if `out_head.bias is not None`, the
   model can still learn an output bias on top of the shared weight,
   which is fine but not classic tied-embedding. Keep `bias=False`.
4. **Tying *and* expecting different gradients** — the whole point is
   one set of weights; gradients are summed. If a test compares
   `tok_emb.grad` and `out_head.grad`, they refer to the same tensor.

## On Completion

### Insight

You added one line of code and changed the model's parameter count by
30%. Weight tying is a perfect example of an architectural choice that
*matters* — at small scale it's mostly free capacity and a useful
regularizer; at huge scale it's a hard cap on what the unembedding can
represent.

The fact that modern frontier models (Llama, Mistral, Qwen) have moved
away from tying says something about the scaling story: when you have
enough data, *more parameters in the right place* beats *fewer
parameters constrained to share structure*. Both choices can be
defended. Neither is obviously wrong.

### Bridge

Chapter 4 is done. You now have:
- A modular set of building blocks (LayerNorm, GELU, FFN, residuals).
- A full transformer block.
- A full GPT model.
- Weight tying as a configurable detail.

Next chapter (chapter 5): pretraining. You'll feed real text through
your model, compute cross-entropy, and watch the loss come down. The
gibberish your model generates today becomes something resembling
language by the end of chapter 5.
