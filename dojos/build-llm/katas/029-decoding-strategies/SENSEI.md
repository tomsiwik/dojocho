# SENSEI — decoding-strategies

## Briefing

### Goal

Implement the four decoding strategies every LLM API exposes:

1. **Greedy** — `argmax`. Deterministic. Repetitive.
2. **Temperature sampling** — sample from `softmax(logits / T)`.
   `T` controls "creativity".
3. **Top-k sampling** — keep only the k highest-probability tokens,
   sample from them.
4. **Top-p (nucleus) sampling** — keep the smallest set of tokens
   whose cumulative probability exceeds `p`, sample from them.

Each function takes raw logits (shape `(V,)`) and returns the chosen
token id (a 0-dim long tensor). All sampling functions accept an
optional `torch.Generator` for deterministic tests.

### Tasks

1. `greedy(logits) -> torch.Tensor` — `argmax`. Returns 0-dim long
   tensor.

2. `temperature_sample(logits, temperature, rng=None) -> torch.Tensor`:
   - Divide logits by `temperature`, softmax, sample via
     `torch.multinomial`.
   - `temperature → 0` approaches greedy.
   - `temperature → infinity` approaches uniform.
   - Edge case: if `temperature == 0`, return `greedy(logits)`.

3. `top_k_sample(logits, k, rng=None) -> torch.Tensor`:
   - Keep only the top-`k` logits, set others to `-inf`.
   - Softmax, sample.
   - `k = 1` MUST equal `greedy`.

4. `top_p_sample(logits, p, rng=None) -> torch.Tensor`:
   - Sort logits descending, softmax them, take the cumulative sum.
   - Keep the smallest prefix whose cum-prob > `p`. Mask the rest to
     `-inf`. Renormalize. Sample.
   - `p = 1.0` keeps every token (equivalent to plain sampling).
   - `p = 0.0` keeps only the top-1 token (equivalent to greedy).

### Hints

- `torch.multinomial(probs, num_samples=1, generator=rng)` returns a
  `(1,)` tensor. `.squeeze()` to get a 0-dim tensor.
- `torch.topk(logits, k)` returns `(values, indices)`.
- For top-p: `sorted_logits, sorted_idx = logits.sort(descending=True)`.
  Then `cumprobs = sorted_logits.softmax(-1).cumsum(-1)`. The mask is
  `cumprobs > p`, **shifted right by one** so you always keep at least
  the top-1 token. Use `sorted_idx` to scatter the mask back to the
  original token order.
- All four functions must return a 0-dim `torch.long` tensor.

## Prerequisites

- Kata 002 (autoregressive-generation — you saw the degeneracy of
  greedy).
- Kata: training-loop (so logits aren't an abstract idea).

## References

- Holtzman et al., 2019 — "The Curious Case of Neural Text Degeneration"
  introduced nucleus (top-p) sampling.
- HuggingFace `transformers.GenerationMixin` — same four knobs.
- OpenAI API docs: `temperature`, `top_p` are exactly these.

## Teaching Approach

**Use-Modify-Create with constraint variation.**

You'll write four functions that build on each other:

| Step | Variation |
|---|---|
| greedy | Baseline. No sampling. |
| temperature | Add: divide logits by T, then sample. |
| top-k | Add: mask all but the top k. |
| top-p | Add: mask by cumulative probability instead. |

Notice the pattern: each step **constrains the distribution** before
sampling. Greedy is the most constrained (one token); plain sampling
is the least (every token).

### Socratic prompts

- After implementation: "A user says 'be more creative'. Which knob,
  and what's the trade-off?" (Raise temperature OR raise top-p. Both
  flatten the distribution. The trade-off: more creative = more
  off-topic / more grammatical errors / more hallucinations.)
- "If you set `top_k=1`, what do you get?" (Greedy.) "If `top_p=0`?"
  (Greedy — only the top-1 token survives the cum-prob cutoff thanks
  to the shift-right trick.) "Why is the shift-right necessary?"
  (Without it, if the very top token already has p > 0.9 and you ask
  top_p=0.9, your mask would exclude every token including the top.
  Always keep at least one.)
- "Why does temperature ABOVE 1.0 increase diversity?" (Dividing
  logits by T > 1 makes them smaller → softmax flatter → distribution
  closer to uniform → more diverse samples.)
- "Why is top-p preferred over top-k in practice?" (Top-k is rigid:
  k=50 means 50 tokens whether the model is 99% sure of the next word
  or completely uncertain. Top-p adapts: 1 token when the model is
  sure, 50 when it's unsure. Adaptive truncation.)

### Common pitfalls

1. **`multinomial` shape** — returns `(num_samples,)`. You want a
   0-dim tensor. `.squeeze()` or `.item()` (but then re-wrap as
   tensor) or `[0]`.
2. **Forgetting to renormalize after masking** — for top-k/top-p,
   after you `-inf`-mask, you MUST softmax again (or set the masked
   probs to 0 and divide by sum). `multinomial` requires probs that
   sum to 1.
3. **Top-p without shift-right** — your function fails when the top
   token already exceeds `p`. The fix is to shift the mask right
   by one position so the top token is never masked.
4. **Top-p sort order** — after masking sorted logits, you need to
   `scatter` the mask back to the original order before sampling.
   Otherwise `multinomial` picks an index that doesn't correspond
   to the original token.
5. **Temperature = 0** — dividing by zero gives `inf` logits, then
   `nan` after softmax. Special-case `T == 0` to return greedy.
6. **Not passing `generator=rng`** — sampling will be
   non-deterministic and tests will flake.

## On Completion

### Insight

Every "creative writing assistant" you've ever used is just one of
these four functions wrapped around a transformer call. The
differences between Claude, GPT, and Llama at the decoding level are
*hyperparameter choices* (default temperature, default top_p), not
algorithmic.

The deeper insight: **the model's distribution is the same**
regardless of decoding strategy. The strategy is a **post-processing
filter** that decides how to consume that distribution. Want
deterministic output? Use greedy. Want creative output? Use temp +
top-p. Want safe-but-coherent? Use low temp + low top-p.

### Bridge

You can train, evaluate, and decode. The last piece: **persistence**.
Training a real LLM takes days; if your machine crashes, you don't
want to start over. Next: **checkpoint-save-resume** — save full
training state (model + optimizer + step), reload it, continue
training as if nothing happened.
