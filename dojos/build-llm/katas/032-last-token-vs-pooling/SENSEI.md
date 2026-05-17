# SENSEI — Last Token vs Pooling

## Briefing

### Goal

A transformer produces `(B, T, d_model)`. A classifier head wants
`(B, d_model)` (or `(B, n_classes)` after a linear). Something has to
collapse the time axis.

Implement three options and feel the trade-offs:

- **last-token pooling** — take `x[:, -1, :]`. The Raschka chapter
  6 default. Only sensible if the last token "sees" the whole
  sequence (causal attention does this).
- **mean pooling** — average over T. Symmetric. Often beats
  last-token for bidirectional encoders, sentiment, toxicity.
- **attention pooling** — learn a query vector `q ∈ R^d`, compute
  `softmax(x @ q) @ x`. The model picks which positions matter.

### Tasks

1. Implement `last_token_pool(x)` — return `x[:, -1, :]`.
   Input shape `(B, T, d)`, output shape `(B, d)`.
2. Implement `mean_pool(x, mask=None)`:
   - If `mask is None`, average over the time axis.
   - If `mask` is `(B, T)` of 0/1, average only over positions where
     `mask == 1` (avoids polluting the mean with padding tokens).
3. Implement `AttentionPool` — an `nn.Module`:
   - In `__init__(d_model)`, register a learnable query
     `self.query: nn.Parameter` of shape `(d_model,)`.
   - In `forward(x)`, compute `scores = x @ self.query` (shape
     `(B, T)`), then `weights = softmax(scores, dim=-1)`, then
     return `(weights[..., None] * x).sum(dim=1)`.

### Hints

- `x[:, -1, :]` is the last token along the time axis.
- `x.mean(dim=1)` averages over T. With a mask, use
  `(x * mask[..., None]).sum(1) / mask.sum(1, keepdim=True).clamp(min=1)`.
- `torch.softmax(scores, dim=-1)` — pick the dim you're collapsing.
- `nn.Parameter(torch.randn(d_model))` registers a trainable vector.

## Prerequisites

- Kata `classification-head-swap` (you swapped the head; this is what
  feeds into it).
- Comfort with broadcasting and `nn.Parameter`.

## References

- Raschka chapter 6 §6.5–6.6 — "last output token" rationale.
- Reimers & Gurevych, "Sentence-BERT" (2019) — mean pooling for
  sentence representations on bidirectional models.

## Teaching Approach

Constraint variation kata + Socratic on when each wins.

### Socratic prompts

- "Why is last-token pooling reasonable for a causal LM but bad for
  a bidirectional encoder like BERT? Walk through what each token
  sees."
- "If you mean-pool an SMS where 90% of tokens are `<pad>`, what
  happens to your representation? What does masking fix?"
- "Attention pooling adds `d_model` learnable parameters. When is
  that worth it? When is it a regularization hazard on a small
  dataset?"
- "For 'is this question well-formed?' — would you bet on
  last-token, mean, or attention pool? Why?"
- "For 'is this paragraph toxic?' — same question. Defend your
  answer in one sentence."

### Common pitfalls

1. **Wrong dim in softmax** — for attention pool, you want softmax
   over T (`dim=-1` after `x @ q`), not over `d_model`. If you get
   it wrong, every token gets weight 1/d, not a probability over time.
2. **Forgetting `.sum(dim=1)`** — after `weights[..., None] * x`, the
   shape is `(B, T, d)`. You still need to collapse T.
3. **Mean pool with padding** — without masking, padded `<pad>`
   embeddings pollute the average. The test catches this.
4. **`mask.sum` of 0** — if a row is all-padding (degenerate input),
   guard with `.clamp(min=1)` to avoid dividing by zero.

## On Completion

### Insight

Raschka picks last-token because it's the simplest answer that's
*correct for causal attention*: the rightmost token has read
everything via the causal mask. For a bidirectional model, every
token has read everything — so you'd use mean (or attention) and
gain a bit of robustness.

Pooling is also where right-padding vs left-padding bites you:
last-token pooling on a right-padded batch reads `<pad>`, not the
real last token. That's why HuggingFace classifiers padded with
attention masks need careful left-padding for causal-LM
classification. This is *not* a bug in your pooler; it's a contract
between pooler and padding strategy.

### Bridge

You can swap the head and you can pool. Next: which parameters are
allowed to learn? You'll write `freeze`/`unfreeze` helpers and
verify, with `.grad`, which parameters the optimizer would actually
update.
