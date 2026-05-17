# SENSEI — positional-embeddings

## Briefing

### Goal

Add learned positional embeddings to token embeddings, GPT-2 style:
two `nn.Embedding` layers, one indexed by token id and one by
position, summed elementwise. Verify the final shape `(B, T, d_model)`
and that the sum genuinely breaks position-blindness.

This kata is the *capstone* of chapter 2. After it, you have the
exact tensor shape GPT-2 feeds into its first transformer block.

### Tasks

1. `make_positional_embedding(context_length, d_model, seed)` — a
   second `nn.Embedding`, this time indexed by position.
2. `position_ids(T, device)` — `torch.arange(T)` (on `device` if
   given).
3. `add_positional(token_emb, pos_layer)` — apply pos_layer to
   `torch.arange(T)`, add to `token_emb` via broadcasting.
4. `forward_input_pipeline(ids, V, D, context_length, seed)` — build
   both layers, return `(B, T, D)`.
5. `demonstrate_position_blindness(V, D, seed)` — return
   `(without_pos, with_pos)` tuple of bools showing the symmetry
   present in raw token embeddings is broken by adding positionals.

### Hints

- Broadcasting works: `(B, T, D) + (T, D) → (B, T, D)`. PyTorch
  expands the (T, D) tensor over the batch dimension.
- The positional embedding's `forward(torch.arange(T))` returns shape
  `(T, D)` — no batch dim needed; broadcasting handles it.
- For the position-blindness demo: a "set of vectors" comparison sorts
  the (T, D) matrix rows by some key (use the first column) so that
  reordering doesn't break the comparison.

## Prerequisites

- `embeddings-and-lookup` — you understand token embeddings as row
  lookups and you know that they are position-blind.

## References

- Raschka chapter 2 §2.8 — "Encoding word positions".
- The GPT-2 paper (Radford et al. 2019), §2.2 — learned positional
  embeddings instead of fixed sinusoids.
- For the alternative (fixed sinusoidal positions used by the
  original Transformer): Vaswani et al. 2017, §3.5.

## Teaching Approach

**Method: Strong Socratic.** This is the second "moment" of chapter 2.
The student should derive *why* a sum works, not just observe that it
does.

### Socratic prompts

- Setup: "In the previous kata you showed `emb([3, 0, 0])[0] ==
  emb([0, 0, 3])[2]`. The token vector depends on the id, period.
  Why is that a problem? Write down a 3-word sentence and its reverse.
  Are they semantically the same?"
- "Take the (T, D) token embeddings for the two sentences. As a
  *multiset* of vectors, what's different about them?"
  (Nothing. Same multiset, different order.)
- "Now: attention (next chapter) is a weighted SUM of value vectors.
  Sum is commutative. So if the inputs are the same multiset, the
  outputs are too. Conclusion?"
  (The model cannot distinguish 'dog bites man' from 'man bites dog'
  using token embeddings alone.)
- "You need to *inject* position information into each vector. The
  constraint: don't break the (B, T, D) shape, don't break the
  parallelism (no per-position custom forward pass), don't introduce
  extra non-attention compute. Brainstorm: what could you do?"
  (Multiply? Concatenate? Add a position-dependent vector?)
- "GPT-2 picks 'add a learned vector per position.' Why does addition
  work and not, say, concatenation? What changes if you concatenate?"
  (Concat doubles D; add keeps D constant. Add lets every dimension
  carry both 'what token' and 'what position' information, the model
  sorts it out.)
- "Run your `demonstrate_position_blindness`. The first bool is True,
  the second is False. State in one sentence what that proves."

### Common pitfalls

1. **Passing the wrong shape into `pos_layer`.** It wants positions,
   not token ids. `torch.arange(T)` is correct; `ids` is wrong.
2. **Forgetting `device`.** If `token_emb.is_cuda` but
   `torch.arange(T)` lives on CPU, the addition errors. Match
   devices.
3. **Re-seeding inside `add_positional`.** Don't. The factory seeds.
4. **`context_length < T`.** If the input sequence is longer than the
   positional embedding's vocabulary, `pos_layer(torch.arange(T))`
   will index out of range. The test confirms this raises.

## On Completion

### Insight

You've finished chapter 2. The output of this kata —
`input_embeddings` of shape `(B, T, D)` — is *exactly* what a
transformer block (next chapter) consumes. The whole pipeline:

  raw text
    → tokenize (regex or BPE)
    → ids                      (B, T) int64
    → token_emb(ids)           (B, T, D) float
    → + pos_emb(arange(T))     (B, T, D) float

…is now sitting in your hands as ~30 lines of PyTorch.

Position info is encoded by addition. That single design choice (vs.
concat, vs. multiply, vs. fixed sinusoids) carries through every
modern LLM. RoPE (chapter 4 of build-reasoning) is a more elegant
variant of the same idea; you'll meet it later.

### Bridge

You've earned a belt. Chapter 3 (build-llm) opens with self-attention,
the mechanism that turns `(B, T, D)` token-and-position-aware vectors
into `(B, T, D)` context-aware vectors. The shape is the same; only
the contents change — and the contents now actually depend on the
order of the tokens, because you added positions.
