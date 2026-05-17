# SENSEI — Pattern Match vs Reasoning

## Briefing

### Goal

Feel the difference between *pattern matching* and *reasoning* in code,
not in prose. You'll build two solvers for the same task — integer
addition — that look superficially similar but generalize wildly
differently. One is a lookup; the other follows a procedure.

This is Raschka build-reasoning chapter 1's core distinction, made
concrete in 30 lines of stdlib Python.

### Tasks

1. Implement `solve_by_memorize(problem, memo)` — given a string like
   `"23 + 19"` and a `dict[str, int]` of known answers, return the
   memorized answer or `None` if unseen.
2. Implement `solve_by_reasoning(problem)` — parse the two operands and
   the operator (`+` only for now), then compute the sum *by digit-wise
   addition with carry*. No `int(a) + int(b)` shortcut — you must walk
   the digits. Return an `int`.
3. Both functions take a `problem: str` of the form `"<a> + <b>"` with
   single spaces. Operands are non-negative integers, possibly of
   different lengths.

### Hints

- Strip and split on `" + "` to get the operand strings.
- Reverse both digit strings so position 0 is the units column.
- Use `ord(d) - ord("0")` to get a digit's value without `int()`.
- Carry: `digit_sum, carry = (a + b + carry) % 10, (a + b + carry) // 10`.
- Remember a trailing carry after the longest operand is exhausted.

## Prerequisites

- Kata 001 (bigram language model) — to feel "lookup table" viscerally.
- Read Raschka build-reasoning chapter 1, sections 1.1 and 1.4.

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, chapter 1.4
  "Pattern matching versus logical reasoning."
- The "penguin can fly" example in §1.4 is the same shape as this kata:
  memorization gives the wrong answer on novel inputs; a procedure
  generalizes.

## Teaching Approach

**Method: Strong Socratic.** This kata is conceptual — the student
should arrive at the insight themselves.

### Socratic prompts

- "Before you write `solve_by_reasoning`, list every input
  `solve_by_memorize` will fail on. What's the pattern?"
- "Your reasoning solver handles `'999 + 1'` without ever having seen
  it. Why? What property does it have that the memo lookup lacks?"
- "If you had infinite memo storage, would memorization match
  reasoning? Pre-compute every `a + b` for `a, b < 10^9`. What goes
  wrong?" → storage explodes; reasoning is *compressed* into a
  procedure.
- After it works: "An LLM trained on `1+1=2 ... 99+99=198` produces
  fluent arithmetic. Is it doing what your `memorize` does or what your
  `reasoning` does? Read §1.5 again — Raschka's answer is subtle."

### Common pitfalls

1. **Using `int()` in `solve_by_reasoning`** — kills the lesson. The
   whole point is that you implement the *procedure*. If you call
   `int("23") + int("19")`, you've just delegated to CPython's
   reasoning. Walk the digits.
2. **Forgetting the final carry** — `"99 + 1"` returns `0` instead of
   `100` if you stop when the operands run out.
3. **Returning a string from `solve_by_reasoning`** — return an `int`.
4. **`solve_by_memorize` raising `KeyError`** — return `None` for
   unseen problems; don't crash. The test expects `None`.

## On Completion

### Insight

You wrote two solvers that *agree on every problem in the memo* and
*disagree on every problem outside it*. That gap — the set of inputs
where a procedure generalizes and a lookup does not — is exactly what
Raschka calls "reasoning" in chapter 1.

The deep version of this idea: an LLM with 175B parameters trained on
the internet is *closer to memorize than to reasoning* by default. The
techniques in chapters 4–8 (CoT prompting, RL, distillation) are
attempts to push the model toward the `reasoning` side of your code —
to make it execute a *procedure* one token at a time rather than recall
a fact in one shot.

### Bridge

The next kata, **chain-of-thought-scorer**, asks: how do you *measure*
whether a model is reasoning or just answering? You'll score
`(problem, response)` pairs by extracting intermediate steps and
checking the final answer separately. You'll discover that the same
final answer can come from very different trajectories — and that
intermediate steps are what give the model a chance to course-correct.
