# SENSEI — 001 Bigram Language Model

## Briefing

### Goal

Build a tiny language model from word-frequency tables. Make
"predict the next token" stop being abstract — it really is "given the
previous word, look up what tends to follow."

### Tasks

1. Implement `tokenize(text)` — lowercase, split on whitespace, strip
   trailing punctuation.
2. Implement `build_bigrams(tokens)` — for each word, count what words
   follow it. Return `dict[str, Counter]`.
3. Implement `next_word(bigrams, word)` — return the most common
   follower of `word`. Return `"<unknown>"` if the word never appeared.

### Hints

- `collections.Counter` is your friend — it has `.most_common(n)`.
- `defaultdict(Counter)` saves you a key check.
- `zip(tokens, tokens[1:])` gives you all adjacent pairs in one line.

## Prerequisites

None — this is the first kata in the build-llm dojo.

## References

- Raschka chapter 1 (build-llm) — purely conceptual; you're making the
  concept concrete in code.
- `collections.Counter` — https://docs.python.org/3/library/collections.html#collections.Counter

## Teaching Approach

### Socratic prompts

- "What does `next_word` need to know about the corpus to make a
  prediction? Forget Python — just describe the data structure."
- "You have `bigrams[w]` as a Counter. What's the difference between
  `Counter().most_common(1)` and `Counter().most_common()`?"
- "If a word never appears in training, what should `next_word` return?
  Pick a sentinel and stick with it — what does the test expect?"
- After it works: "What does this model NOT know about language? List
  three things. (Hint: it only sees one word of context.)"

### Common pitfalls

1. **Not handling unknown words** — `bigrams[w]` on a `defaultdict`
   creates an empty entry as a side effect. Test for `w not in bigrams`
   first.
2. **Returning Counter directly** — `next_word` should return a string,
   not a `(str, int)` tuple or a Counter.
3. **Punctuation in tokens** — `"cloak."` and `"cloak"` are different
   tokens unless you strip. `tokenize` is the place; don't paper over
   in `build_bigrams`.

## On Completion

### Insight

You wrote a real language model in about 20 lines. It predicts the next
token from frequency counts — no neural net, no training. GPT-3 has 175
billion parameters and was trained for $4.6M of compute, and it is
doing *the same thing* you just did, with more context (thousands of
previous tokens) and a learned representation that lets it generalize
to bigrams it has never seen. The next 20 katas are about that
generalization.

### Bridge

Kata 002 wraps your bigram model in a generation loop — the
**autoregressive** mechanism that turns "predict one token" into "write
a paragraph". You'll discover why greedy generation is degenerate and
what temperature buys you.
