# SENSEI — extract-boxed-answer

## Briefing

### Goal

Reach into a model's free-form answer and pull out the content of its
final `\boxed{...}` expression. This is **step 3** of Raschka's 8-step
verifier pipeline (chapter 3): without reliable extraction, every
downstream grading step is noise.

The hard part is not finding `\boxed` — `str.rfind` does that in one
call. The hard part is the braces. A model that writes
`\boxed{\frac{14}{3}}` has three opening braces and three closing
braces, and a naive `find('}')` walks off the wrong one.

### Tasks

1. Implement `extract_boxed(text)`:
   - Locate the **last** `\boxed` in the text.
   - Skip into the opening `{`.
   - Walk forward tracking brace depth, incrementing on `{` and
     decrementing on `}`.
   - Return the content (exclusive of the outer braces) when depth
     returns to 0.
   - Return `None` if there is no `\boxed`, no opening brace follows
     it, or the braces never balance.

### Hints

- `str.rfind(r"\boxed")` returns -1 when missing.
- After `\boxed`, the next non-whitespace character must be `{`.
- A depth counter starting at 1 (after consuming the opening `{`) is
  the cleanest pattern. When it hits 0, the *previous* character was
  the matching `}`.
- Don't try to do this with a regex — `re` is not designed for
  balanced-bracket matching.

## Prerequisites

- Comfort with `str.rfind`, slicing, and a simple while loop.
- Optional: skim listing 3.4 in Raschka build-reasoning ch03 — the
  reference implementation is ~25 lines of Python with the same shape.

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, ch. 3.4, listing
  3.4 (`get_last_boxed`).
- https://github.com/rasbt/reasoning-from-scratch/tree/main/ch03

## Teaching Approach

**Method:** worked example + Socratic.

### Socratic prompts

- "Why `rfind` and not `find`? When a model writes intermediate boxes
  during its reasoning, which one do you trust?"
- "Sketch the brace-depth counter for `\\boxed{\\frac{14}{3}}` on
  paper. What value does depth have right after consuming each `{` and
  each `}`?"
- "What happens when you call `text[idx]` and `idx == len(text)`?
  Where in your loop does that case sneak in?"
- "Could you do this with a regex? Try writing one that matches a
  balanced `\\boxed{...}`. Notice anything?"

### Common pitfalls

1. **Off-by-one on the content slice.** When depth hits 0, the index
   has already moved *past* the closing `}`. The content runs from
   `content_start` to `current_idx - 1`.
2. **Returning the first box instead of the last.** `find` not
   `rfind`. The test `test_multiple_boxes_returns_last` catches this.
3. **Crashing on unbalanced braces.** Add `current_idx < len(text)` to
   your loop guard, and check `brace_depth == 0` before returning.
4. **Regex temptation.** Recursive bracket matching is not a regular
   language. Don't.

## On Completion

### Insight

You just wrote step 3 of an evaluation pipeline used to grade GPT-class
models on MATH-500. Every grader of every math benchmark — MATH-500,
GSM8K, AIME — runs some variant of this. The function looks tedious
because it *is* mechanical, but it has to be deterministic and
debuggable: when grading disagreements happen, the first question is
always "did the extractor see what I think it saw?"

### Bridge

Extraction gives you a string. The next kata, **normalize-numeric-
answer**, asks the more uncomfortable question: when are two answer
strings "the same"? `1,000` vs `1000`? `1/2` vs `0.5`? `5 dogs` vs
`5`? You'll discover that "normalize" is a design decision, not a
truth.
