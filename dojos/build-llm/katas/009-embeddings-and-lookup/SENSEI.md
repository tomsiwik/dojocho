# SENSEI — embeddings-and-lookup

## Briefing

### Goal

Internalize that `nn.Embedding(V, D)` is *mathematically* a one-hot
times a learned matrix, but *implemented* as a row-select. You will
prove the equivalence by implementing both versions and asserting they
produce identical tensors.

This is one of *the* moments in the book. After this kata you should
understand:

- Why `nn.Embedding.weight` has shape `(vocab_size, d_model)`.
- Why a token id is just "the row index of the row you want."
- Why nobody actually computes the one-hot matmul in practice.
- Why the embedding layer is "learnable" — its weight is just a
  parameter, updated by gradient descent like any other layer.

### Tasks

1. `make_embedding(V, D, seed)` — reproducible `nn.Embedding`.
2. `embed_via_lookup(ids, emb)` — the production way.
3. `embed_via_onehot_matmul(ids, emb)` — the textbook-equivalent way,
   using `torch.nn.functional.one_hot` + matmul.
4. `embed_batch(ids, V, D, seed)` — convenience wrapper for shape
   verification.

### Hints

- `F.one_hot(ids, num_classes=V)` returns int64. Cast `.float()`
  before matmul (or PyTorch will refuse to matmul int @ float).
- The matmul shape sanity check: `(B, T, V) @ (V, D) → (B, T, D)`.
  Yes, the same op works on 3D inputs — last two dims do the matmul.

## Prerequisites

- `gpt-dataset` — you have (B, T) integer batches and now need to turn
  them into (B, T, D) float tensors.

## References

- Raschka chapter 2 §2.7 — "Creating token embeddings".
- PyTorch `nn.Embedding` docs:
  https://pytorch.org/docs/stable/generated/torch.nn.Embedding.html
- The companion notebook
  `upstream/LLMs-from-scratch/ch02/03_bonus_embedding-vs-matmul/` has
  Raschka's own version of this equivalence proof.

## Teaching Approach

**Method: Strong Socratic.** This is THE conceptual moment of chapter
2. The student should derive the equivalence themselves before writing
the matmul implementation.

### Socratic prompts

- "You set `vocab_size = 50_000`. A one-hot vector for a single token
  has 50,000 entries. You multiply by a 50,000 × 768 matrix. Of those
  50,000 multiplications, how many are nonzero?"
  (One.)
- "If exactly one term in the dot product is nonzero, what is that
  term equal to?"
  (Row k of W, where k is the position of the 1 in the one-hot.)
- "So the result of the matmul is...?"
  (Row k of W, unchanged. The matmul *is* a row-lookup.)
- "What would the cost be in FLOPs if you actually built the one-hot
  and did the matmul? Now what's the cost of a row-lookup?"
  (50,000 × 768 vs. ~768. Almost five orders of magnitude.)
- "If you save `emb.weight` to disk after training, what have you
  saved?"
  (A learned representation for every token: row k is the model's
  learned vector for token k.)
- "The tests assert position-independence: same id, same vector,
  regardless of position. Why is that a *problem* for language
  modeling? What information has been thrown away?"
  (Token order — sets up the positional-embeddings kata next.)

### Common pitfalls

1. **Forgetting `.float()` on the one-hot.** `F.one_hot` returns
   int64. `int @ float` → `RuntimeError: expected scalar type Float`.
2. **Wrong `num_classes`.** Must equal `vocab_size`. Defaults to
   `max(ids)+1`, which gives the wrong shape when your batch doesn't
   contain the highest id.
3. **Trying to compare with `==`.** Use `torch.equal` or
   `torch.allclose`; float compare can fail on bit-level rounding.
4. **Re-seeding inside `embed_via_lookup`.** Don't. The factory
   `make_embedding` is the only place that seeds.

## On Completion

### Insight

`nn.Embedding` looked magic until you wrote the matmul version next to
it. It's just `one_hot(ids) @ W` with the algebra folded into a
gather. The "learning" lives in `W`, which has the same gradient
machinery as any other parameter — the LLM literally trains its own
dictionary of word vectors during pretraining.

But notice the test that asserts position-independence:
`emb([3, 0, 0])[0] == emb([0, 0, 3])[2]`. The id alone determines the
vector. Two sentences with the same words in different orders produce
the same set of embedding vectors. That cannot be right for language —
"dog bites man" must not equal "man bites dog."

### Bridge

Next: `positional-embeddings`. You'll add a second `nn.Embedding`
indexed by *position* (0..T-1) and simply *add* it to the token
embeddings. That single addition is how GPT-2 learns "where" each
token is, while preserving the parallelism that makes attention fast.
