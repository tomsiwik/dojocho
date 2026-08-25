# Transform a Display Name

## Objective

The learner should understand normalization as a sequence of pure string
transformations and learn how JavaScript can replace a complete run of varied
whitespace with one hyphen without mutating the original string.

## Current concept

The learner already understands trimming and lowercasing. They need to learn
the replacement API and the distinction between one literal space and a run of
whitespace characters.

## Misconceptions

- Replacing the literal string `" "` handles tabs and line breaks.
- Replacing individual whitespace characters is equivalent to replacing a run.
- String transformation methods mutate their receiver.

## References

- MDN Web Docs: `String.prototype.replace()` for replacement semantics.
- MDN Web Docs: regular-expression character classes for whitespace.
- MDN Web Docs: quantifiers for matching a non-empty run.

## Teaching approach

Use authoritative definitions for unfamiliar API or regex knowledge. Illustrate
each missing idea in a different domain before asking the learner to apply it to
their handle normalizer. Do not assemble the kata's final replacement expression
for them.

When the learner does not understand what a whitespace run is, show the authored
`whitespace-runs` fragment before continuing the dialogue.

<Present id="whitespace-runs">
A **run** is one or more adjacent characters treated as a single group. In
`red   blue`, the three spaces form one whitespace run. Tabs and line breaks are
whitespace too, so a run can contain more than ordinary spaces.
</Present>

## Completion insight

Normalization creates one stable boundary representation so downstream domain
logic does not repeatedly account for equivalent input forms.

## Review topics

When the learner chooses Review, always clarify method chaining versus currying,
then choose two connected topics below. Ground them in the learner's actual
expression instead of reciting the whole checklist. Use at most three short
paragraphs. Do not introduce a fourth topic.

Accuracy constraint: `/\s+/g` replaces each complete whitespace run once. A
leading or trailing run becomes exactly one boundary hyphen, never one hyphen
per character in that run.

- The sequence is method chaining and a transformation pipeline, not currying.
  Currying converts a multi-argument function into nested one-argument functions.
- Ordering is observable: trimming before replacement prevents boundary
  whitespace from becoming separators. A whole leading or trailing whitespace
  run would become one boundary hyphen, regardless of its length.
- `toLowerCase()` is preferable for a stable machine identifier;
  `toLocaleLowerCase()` intentionally varies for locale-sensitive human text.
- The normalizer is idempotent: normalizing an already canonical value should
  leave it unchanged.
- `\s`, `+`, and `g` answer different questions: character class, match size,
  and search continuation.
