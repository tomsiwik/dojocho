# SENSEI — 002 Autoregressive Generation

## Briefing

### Goal

Wrap your bigram model from kata 001 in a generation loop. This is the
*autoregressive* mechanism — feed each predicted token back as the
next input — that every modern LLM uses to write a paragraph.

Plus: discover that greedy generation is degenerate, and learn what
temperature buys you.

### Tasks

1. Implement `sample_next(bigrams, word, temperature, rng)`:
   - `temperature == 0.0` → return the argmax (greedy, deterministic).
   - `temperature > 0.0` → sample proportional to
     `count ** (1 / temperature)`.
   - Word with no followers → return `"<end>"`.
2. Implement `generate(bigrams, seed, n_tokens, temperature, rng_seed)`:
   - Start with `[seed]`. Loop `n_tokens - 1` times.
   - Each step: sample the next word, append. Stop if `<end>`.
   - Return the list of tokens.

### Hints

- `random.Random(seed)` gives you a deterministic RNG.
- `random.choices(population, weights=...)` is the one-call API.
- Greedy = `Counter.most_common(1)[0][0]`. Easy.
- Temperature: `weight = count ** (1 / temperature)`. Higher T → flatter
  distribution; lower T → sharper toward argmax.

## Prerequisites

- Kata 001 (bigram language model).

## References

- Raschka chapter 1, §1.6 — autoregressive models.
- `random.choices` — https://docs.python.org/3/library/random.html#random.choices

## Teaching Approach

### Socratic prompts

- "If you call `generate(bigrams, 'the', 20)` with temperature=0, what
  do you predict happens? Why? (Run it after predicting.)"
- "When `temperature` is 0.0, what's the right code path? When it's
  greater than 0, what changes?"
- "Temperature 2.0 vs 0.5 — which one is more 'creative'? Which is more
  'confident'? Why?"
- After it works: "Greedy generation produced a repeating loop. Why?
  Look at `bigrams['wind']` and `bigrams['and']` — trace the cycle."

### Common pitfalls

1. **Forgetting the deterministic RNG** — without `rng_seed`, tests
   can't compare your output. Tests pass `rng_seed` and expect
   reproducibility for the same seed.
2. **Misordering temperature special-case** — `if temperature <= 0`
   must come *before* `random.choices`, otherwise `1/0` divides by
   zero.
3. **Not handling `<end>`** — `sample_next` returns `<end>` for a
   word with no successors. `generate` must break the loop on that.
4. **Mutating `bigrams[word]`** — if you `bigrams[word]` a brand-new
   word and it's a `defaultdict`, you create an empty entry. Use
   `word not in bigrams` first.

## On Completion

### Insight

The whole "autoregressive generation" idea is this five-line loop. GPT
does the same loop — its `sample_next` is a much more expensive model
forward pass, but the **shape** of the algorithm is identical: predict
one token, append, repeat.

Temperature is the same operation in both your code and a real GPT
sampler: `softmax(logits / T)`. Your version uses
`count ** (1/T)` because you don't have logits — it's the discrete
analogue. You'll meet the real `softmax` version in kata 064 (chapter 5
decoding).

### Bridge

Kata 003 contrasts decoder-style (what you just built — past only)
with encoder-style (bidirectional). Same data, two task framings — the
seed of the BERT-vs-GPT distinction.
