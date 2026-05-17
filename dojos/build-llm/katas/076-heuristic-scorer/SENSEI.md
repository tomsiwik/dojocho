# SENSEI — heuristic-scorer

## Briefing

### Goal

Build three rule-based scorers — small, fast, deterministic functions
that read a model's answer and return a number in `[0, 1]`. These are
the simplest scorers in section 5.3 of build-reasoning, and they form
the baseline that more sophisticated scorers (logprob, LLM-as-judge,
verifier) get compared against.

You will also feel — in your bones — why Goodhart's Law matters.

### Tasks

Each function returns a `float` in `[0.0, 1.0]`.

1. `score_length(answer: str) -> float`
   - Decays exponentially with length: `exp(-len(answer) / 500)`.
   - Empty string → 1.0. Very long string → near 0.
   - Mirrors the brevity term in listing 5.3.

2. `score_contains_keyword(answer: str, keyword: str) -> float`
   - Case-insensitive substring match.
   - Returns `1.0` if the keyword appears, else `0.0`.
   - Empty `keyword` → `1.0` (vacuously true).

3. `score_boxed_format(answer: str) -> float`
   - Returns `1.0` if the answer contains `\boxed{<something>}` with
     at least one character inside the braces, else `0.0`.
   - Mirrors `boxed_bonus` in listing 5.3, normalized to `[0, 1]`.

### Hints

- `import math` for `exp`. No regex needed for length or keyword.
- For `score_boxed_format`, the `\b` in `\boxed` is a literal
  backslash + `b`, not a word boundary. Match the literal string.
- Use `re.search` for boxed format — `\\boxed\{([^}]+)\}` captures
  the inside. The `+` (not `*`) enforces "at least one character".

## Prerequisites

- `refinement-loop` (to know what consumes these scorers).

## References

- build-reasoning ch5 §5.3 (listing 5.3, `heuristic_score`).
- Goodhart, "Problems of Monetary Management" (1975) — the original
  "when a measure becomes a target, it ceases to be a good measure."

## Teaching Approach

Constraint variation + Socratic on metric gaming.

### Constraint variation

Once `score_length` passes, ask: "Change the 500 to 50. What happens
to a 200-character answer? To a 10-character answer? Now imagine
your model is trained to maximize this score. What does it learn to
output?"

### Socratic prompts

- "The scorer rewards short answers. A model that minimizes the
  length wins. What's the shortest possible answer? Is it a useful
  answer?" → Goodhart's Law made concrete.
- "Why is `score_contains_keyword('the answer is 7', 'banana') = 0`
  but `score_contains_keyword('the answer is 7', '')` = 1? Is the
  second case a bug or a feature?" → vacuous truth + edge-case design.
- "If `score_boxed_format` returns 1 for `\boxed{42}` AND `\boxed{}`
  with no content, what attack does that enable?" (Trick: the spec
  forbids empty braces — but ask anyway.)
- "You have three scorers. To get an overall quality score, do you
  add them, multiply them, or take the min? What does each choice
  mean about your beliefs?" → linear vs multiplicative reward models.

### Common pitfalls

1. **Forgetting case-insensitivity** in `score_contains_keyword`.
   `"BANANA"` should match `"banana"`.
2. **Treating `\b` as a regex word boundary** in `score_boxed_format`
   when matching the literal `\boxed`. Escape as `\\\\boxed` in regex,
   or use plain `in` for the prefix check.
3. **Returning a number outside `[0, 1]`** for `score_length`. With
   the given formula it cannot exceed 1, but if you re-derive the
   formula and forget the negative sign you'll get values > 1.

## On Completion

### Insight

You wrote three of the cheapest possible reward functions. In
build-reasoning ch5 table 5.1, swapping in heuristic scoring inside
self-refinement moved MATH-500 accuracy by only ~1 percentage point —
sometimes up, sometimes down. The cheap reward is a weak signal: it
detects answer *shape* (formatted, brief, contains keyword), not
answer *correctness*.

This is the central tension of inference-time scaling: a scorer
cheap enough to run at every step is rarely strong enough to rank
answers reliably. The next step up — the logprob scorer — is also
weak (row 6 in table 5.1 is *worse* than no scorer). The step after
that — an LLM-as-judge or a trained verifier — is what unlocks the
DeepSeekMath-V2 results from late 2025.

### Bridge

`stopping-criteria` is the other piece of the acceptance machinery:
given a sequence of scores from these functions, when do you stop
refining? Then `best-of-refined` combines a scorer with parallel
samples — the moment where "scoring is cheap enough to run on every
candidate" finally pays off.
