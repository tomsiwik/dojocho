# SENSEI — simple-regex-tokenizer (SimpleTokenizerV1)

## Briefing

### Goal

Implement Raschka's `SimpleTokenizerV1` (listing 2.3) — a regex-based
tokenizer with `encode` and `decode` methods over a closed vocabulary.

This is the first kata where the tokenizer is a real class with state
(the vocab) and behavior (round-trip encode/decode). It also
deliberately *crashes* on out-of-vocabulary words — that broken
behavior is what motivates the next two katas.

### Tasks

1. Implement `tokenize(text)` using the chapter-2 regex
   `r'([,.:;?_!"()\']|--|\s)'`. Keep capitalization. Drop
   whitespace-only items.
2. Implement `build_vocab(tokens)` — sorted, deterministic map.
3. Implement `SimpleTokenizerV1` with `__init__`, `encode`, `decode`.
   - `decode` joins with single spaces, then removes the space before
     punctuation via a second regex (so "Hello ," → "Hello,").

### Hints

- The regex captures the delimiters as items, so the list contains
  alternating word/delim/word/delim. Use `re.split(...)`.
- The "remove space before punctuation" pattern lives in the chapter
  text — copy it: `re.sub(r'\s+([,.?!"()\'])', r'\1', text)`.

## Prerequisites

- Kata 001 (you've tokenized before, but with whitespace + lowercase).

## References

- Raschka chapter 2 §2.2-2.3 (build-llm) — the exact regexes are in
  the chapter.
- Listing 2.3 — `SimpleTokenizerV1` class.

## Teaching Approach

**Method: Worked example → Socratic reflection.** The chapter spells out
the exact regexes; the student's job is to wire them into a class and
*feel* the brittleness.

### Socratic prompts

- Before running tests: "Read listing 2.3. What does the V1 tokenizer
  promise about its vocabulary? What does it assume about the inputs
  it will see?"
- When `test_encode_raises_keyerror_on_unknown` lights up green
  (because it's *expecting* the crash): "The crash IS the feature here.
  What did your model promise about its vocabulary, and what input just
  violated that promise?"
- "Real corpora are unbounded — Wikipedia tomorrow will contain a word
  it didn't yesterday. List two things you could do instead of crashing.
  Which one preserves the most information about the unknown word?"
  (Leads naturally to next kata: `<|unk|>` vs. subword.)

### Common pitfalls

1. **Lowercasing.** Don't. V1 keeps case (unlike kata 001's tokenizer).
   Capitalization carries proper-noun signal an LLM uses.
2. **Forgetting to strip whitespace items.** `re.split(r'(\s)', ...)`
   leaves `' '` items in the list. Filter with `if item.strip()`.
3. **Decode produces "word ," with a space.** That's the second regex's
   job. Without it the round-trip is ugly.
4. **Catching the KeyError.** V1 must NOT handle it. The test asserts
   it propagates.

## On Completion

### Insight

You wrote a tokenizer with a closed vocabulary. It works perfectly on
text drawn from the training corpus and shatters on anything else.
This is the OOV (out-of-vocabulary) problem, and it is the central
reason real LLMs do not use word-level tokenization.

### Bridge

Next kata patches this with `<|unk|>` — but `<|unk|>` is a *bandaid*,
not a solution: the model learns nothing about the word, only that
*some* unknown word was there. The kata after introduces tiktoken's
BPE, which solves OOV properly by decomposing words into subwords.
