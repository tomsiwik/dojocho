# SENSEI — Chain-of-Thought Scorer

## Briefing

### Goal

Build the *measurement instrument* that the rest of build-reasoning
depends on: given a `(problem, response)` pair, count the intermediate
reasoning steps and extract the final answer. This lets you ask
empirical questions like "does CoT help?" instead of philosophical ones.

You will discover that a response can be **correct without reasoning**
(memorized) and **correct with reasoning** (worked out), and that the
scorer treats both as correct — but separately reports the step count.
That separation is the data you need to compare models in later
chapters.

### Tasks

1. Implement `extract_steps(response)` — split `response` on either
   `"\n"` or `". "` (period + space), strip each piece, drop empties.
   Return `list[str]`. The *final* piece is the answer; everything
   before it is an intermediate step.
2. Implement `extract_answer(response)` — return the last non-empty
   step, with any leading `"Answer: "` prefix and trailing period
   stripped. Return `str`.
3. Implement `score(response, expected_answer) → (correct, n_steps)`:
   - `correct: bool` is `extract_answer(response) == expected_answer`.
   - `n_steps: int` is `len(extract_steps(response)) - 1` (everything
     before the final answer). Minimum 0.

### Hints

- `response.replace(". ", "\n").split("\n")` is one way to handle both
  separators in one shot.
- Use `str.strip()` and filter `if s` to drop empties.
- For `extract_answer`: `step.removeprefix("Answer: ").rstrip(".")`.

## Prerequisites

- `pattern-match-vs-reasoning` (previous kata) — you need the
  procedure-vs-lookup distinction in your bones.
- Raschka build-reasoning §1.1 (CoT definition).

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, §1.1
  "Defining reasoning in the context of LLMs" — defines CoT as
  intermediate steps before a final answer.
- Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large
  Language Models* (2022): https://arxiv.org/abs/2201.11903

## Teaching Approach

**Method: Demo + Socratic.** Have the student *run* a small
demonstration before they ask "what does this kata teach me?"

### Demo to suggest first

After the test file passes, hand the student this snippet to try in a
REPL:

```python
import solution as s
no_cot   = "Answer: 42"
with_cot = "23 + 19. First, 3+9=12, write 2 carry 1. 2+1+1=4. Answer: 42"
print(s.score(no_cot, "42"))     # (True, 0)
print(s.score(with_cot, "42"))   # (True, ~3)
```

Then ask the questions.

### Socratic prompts

- "Both responses are scored correct. Why does the kata bother
  returning `n_steps` at all? What can you measure with it that you
  couldn't measure with just `correct`?"
- "Same final answer, very different `n_steps`. Same weights, same
  input — only the prompt's phrasing changed. Why does asking 'show
  your work' change the *answer* an LLM gives at all?" → derive: each
  intermediate token is another forward pass, another chance to
  course-correct based on what was just emitted.
- "If a wrong response includes 20 polished-looking steps, does
  `score` give partial credit?" → no — the kata splits the two
  signals deliberately. (This is what an *evaluator* in chapter 3
  has to decide: count correctness only, or also reward effort.)
- "What happens to `score` if the model produces `'Answer: 42.'`
  with a trailing period?" → run the test; trace through your
  `extract_answer`.

### Common pitfalls

1. **Counting the answer as a step** — `n_steps` is everything
   *before* the final answer. `len(steps) - 1`, not `len(steps)`.
2. **Off-by-one when no intermediate steps** — `"Answer: 42"` →
   `n_steps == 0`, not `-1`. Use `max(0, ...)` or just structure the
   logic so it can't go negative.
3. **Splitting only on `\n`** — many LLM responses use prose with
   `". "` separators. The test will catch this.
4. **Forgetting to strip** — leading/trailing whitespace and stray
   periods make exact-string comparison fail. The whole point of
   `extract_answer` is to normalize.

## On Completion

### Insight

You now own the basic measurement primitive for reasoning research.
`(correct, n_steps)` lets you ask: does adding "let's think step by
step" change `correct`? Does it change `n_steps`? Does the relationship
between the two change with model size? Every empirical claim about CoT
in the literature is built on top of a scorer that does what yours
does.

The subtler observation: `n_steps` is a *proxy* for compute. More
intermediate tokens = more forward passes = more chances for the model
to notice "wait, that's wrong" and self-correct. This is why chain-of-
thought works at all. The model isn't getting smarter; it's getting
*more attempts*, conditioned on its own prior output.

### Bridge

The next kata, **inference-vs-training-tradeoff**, makes the
"more attempts" idea explicit. You'll implement `inference_scaling`
(sample N times, take the majority) and compare it against
`training_loss` (improve the weights instead). You'll feel the trade-
off Raschka introduces in §1.3: spend compute at inference, or spend
compute at training — both work, both cost, and they cost differently.
