# SENSEI — normalize-numeric-answer

## Briefing

### Goal

Take a model's extracted answer string and rewrite it in a canonical
form so that `==` against the reference answer becomes a meaningful
comparison. This is **step 4** of Raschka's verifier pipeline.

The exact set of normalizations is a **design choice**, not a
universal truth. Each rule you add boosts grader recall (catches more
correct-but-formatted-differently answers) at some cost to precision
(might match an answer that's actually wrong). This kata gives you a
small, opinionated set so you can feel the trade-off.

### Tasks

Implement `normalize(answer)`:

1. Strip leading/trailing whitespace.
2. Remove commas inside numbers (`"1,000"` -> `"1000"`,
   `"1,234,567"` -> `"1234567"`).
3. Strip trailing unit words / any trailing non-numeric tail
   (`"5 dogs"` -> `"5"`, `"42 meters"` -> `"42"`).
4. Convert `a/b` into a decimal string rounded to 6 decimal places
   (`"1/2"` -> `"0.5"`, `"14/3"` -> `"4.666667"`).
5. If none of these apply, return the trimmed input unchanged.

### Hints

- `str.replace(",", "")` is enough for thousands separators *if* you
  guard against accidentally stripping commas from list-like answers.
  For this kata, replacing every comma is fine.
- A regex like `r"^(-?\d+(?:\.\d+)?)"` plucks a leading number.
- `"1/2".split("/")` then `int(num) / int(den)` is the simplest
  fraction conversion. Wrap in `try/except ValueError` for non-numeric
  splits.
- `round(x, 6)` then `f"{x:g}"` is one way to get "0.5" instead of
  "0.500000". `str(round(...))` is another. Both work — pick one.
- `fractions.Fraction` is overkill here but harmless if you reach
  for it.

## Prerequisites

- `extract-boxed-answer` (you're normalizing what the extractor
  returned).
- Regex basics (`re.sub`, `re.match`).

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, ch. 3.5, listing
  3.6 (`normalize_text`) — your version is a small subset of his.
- `re` docs: https://docs.python.org/3/library/re.html

## Teaching Approach

**Method:** constraint variation + Socratic.

### Socratic prompts

- "What does stripping commas help with? What could it break? Imagine
  a problem whose answer is the list `1, 2, 3`."
- "Converting `1/2` to `0.5` makes those two strings match. What does
  it do to `1/3` vs `0.333333333333`? Where does precision get lost?"
- "If you strip the trailing word `dogs` from `5 dogs`, does the
  grader now count `5 cats` as correct against gold `5 dogs`?
  Whose problem is that?"
- "Each normalization rule is a +recall / -precision trade. What's the
  cost-of-being-wrong in a grader? Compare to an information retrieval
  system."

### Common pitfalls

1. **Crashing on non-fraction input containing `/`.** `"a/b".split("/")`
   then `int("a")` raises. Wrap in `try`.
2. **Returning a float, not a string.** The function signature is
   `-> str`. Downstream comparison code expects strings.
3. **Stripping the minus sign.** Watch your regex if you decide to
   "keep only digits" — `-5` is a valid answer.
4. **Float formatting.** `str(0.5)` -> `"0.5"`, but
   `str(round(1/3, 6))` -> `"0.333333"`. The test pins specific
   strings — match them.

## On Completion

### Insight

Every grader you'll ever ship is, at heart, "extract + normalize +
compare". The normalize step is where most of the disagreement
between papers happens. When a paper claims "44.8% on MATH-500" and
another claims "47.1%" on the same model, the difference is almost
always the normalizer.

### Bridge

Next: `match-answers-layered` makes the normalizer *part of* a
three-tier match function. You'll write `strict`, `normalized`, and
`math_equivalent` modes and discover when each is appropriate.
