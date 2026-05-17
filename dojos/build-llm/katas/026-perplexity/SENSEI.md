# SENSEI — perplexity

## Briefing

### Goal

Implement perplexity. It's two characters: `exp(loss)`. The point of
this kata is the *interpretation*, not the code.

> Perplexity is the effective number of tokens the model is choosing
> between, on average, at each position.

A perplexity of 7 means "the model is as confused as if it had to
pick uniformly from 7 options." A perplexity of 1 means perfect
prediction. A perplexity of `vocab_size` means random guessing.

### Tasks

1. Implement `perplexity_from_loss(cross_entropy_loss)`:
   - Input: a scalar tensor (the CE loss).
   - Return: `exp(loss)` as a scalar tensor.

2. Implement `perplexity_from_logits(logits, targets)`:
   - Input: logits `(N, V)`, targets `(N,)`.
   - Compute CE, then return `exp(CE)`.
   - You may use `F.cross_entropy` here — the prior kata was the
     hand-rolled version.

### Hints

- `torch.exp(tensor)` — that's it.
- For step 2: `F.cross_entropy(logits, targets)` returns a scalar
  ready to exponentiate.

## Prerequisites

- Kata: cross-entropy-from-logits.

## References

- Raschka chapter 5 — perplexity is mentioned briefly but it's the
  standard metric for language modeling.
- Wikipedia: Perplexity (the formula `exp(H)` where H is entropy in
  nats).

## Teaching Approach

**Socratic from the formula.** This kata is 4 lines of code; the
learning is in the questions.

### Socratic prompts

- "If `loss = 0`, what's perplexity? Why does that mean 'perfect'?"
  (Answer: `exp(0) = 1`. Perplexity of 1 = the model puts probability
  1 on the true next token, every time.)
- "If `loss = log(V)` for vocab of size V, what's perplexity?"
  (Answer: `exp(log(V)) = V`. That's uniform — pure random guessing
  over the vocab. The lower bound for 'no learning'.)
- "GPT-2 reports a perplexity of ~17 on Wikitext. With a vocab of
  50,257, what does that tell you intuitively?" (The model has
  narrowed 50,257 options down to ~17 effective choices per position.
  That's compression by a factor of ~3000.)
- "Why report perplexity instead of loss? They contain the same
  info." (Humans can't think in nats. They can think in 'how many
  options is the model choosing between'.)

### Common pitfalls

1. **Forgetting `exp`** — perplexity is `exp(loss)`, not `loss`
   itself. Easy slip when you're tired.
2. **Wrong base** — `torch.exp` uses base `e` (natural log). If loss
   were in bits (base 2), perplexity would be `2 ** loss`. CE in
   PyTorch is in nats, so `exp` is right.
3. **Reporting on logits instead of mean loss** — perplexity is a
   single number per dataset, not per token.

## On Completion

### Insight

You can now sanity-check any LLM training run in one number:

- Untrained model on vocab V: perplexity ≈ V.
- After a few epochs: should drop to **single digits or low tens**
  on the training set.
- If train perplexity stays at ~V, the model isn't learning.
- If train perplexity drops but val perplexity climbs back up,
  you're overfitting.

You'll wire all three of these checks into the next two katas.

### Bridge

Next: **training-loop**. You have a loss; you have a metric. Time to
actually decrease them — the 5-line PyTorch ritual:
`zero_grad → forward → loss → backward → step`.
