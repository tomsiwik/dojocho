"""normalize-numeric-answer — canonicalize a numeric answer string.

The model might write "1,000", " 1000 ", "1000 dogs", or "1/2". The
reference answer is "1000" or "0.5". `==` would fail every one of
these. Normalization is the bridge.

This kata implements a **minimal** normalizer — just enough to make
the layered grader in the next kata interesting. Raschka's full
`normalize_text` (listing 3.6) does a lot more (LaTeX, sqrt, frac, ...);
that's a different exercise.

Your normalizer must:
1. Strip leading/trailing whitespace.
2. Strip commas inside numbers ("1,000" -> "1000", "1,234,567" -> "1234567").
3. Strip trailing units / non-numeric trailing tokens ("5 dogs" -> "5",
   "42 meters" -> "42").
4. Convert simple fractions ("1/2" -> "0.5", "14/3" -> "4.666667"),
   rounded to 6 decimal places. Keep the result as a string.

If none of the above apply, return the cleaned (whitespace-stripped)
input unchanged.
"""


def normalize(answer: str) -> str:
    """Return a canonical-form numeric string for `answer`.

    Examples:
        normalize("  42 ")        -> "42"
        normalize("1,000")        -> "1000"
        normalize("1,234,567")    -> "1234567"
        normalize("5 dogs")       -> "5"
        normalize("1/2")          -> "0.5"
        normalize("14/3")         -> "4.666667"
        normalize("hello")        -> "hello"
    """
    ...  # implement me
