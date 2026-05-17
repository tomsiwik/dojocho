# SENSEI — llm-judge-mock

## Briefing

### Goal

Implement a **deterministic rule-based judge** that returns a 1-5
quality score for a `(question, response, reference)` triple. The
point is not to replicate GPT-4 — it's to make the judge's behavior
inspectable so you can reason about *what an LLM judge is actually
doing* and where the biases come from.

The rubric (mirrors appendix F.5's grading scale):
- **5**: Response substantively matches reference (high token
  overlap with reference, no refusal/punt).
- **4**: Response mostly matches (substantial overlap, may add
  extra material).
- **3**: Partial overlap — some right tokens, some wrong/missing.
- **2**: Mostly wrong; little overlap.
- **1**: Refusal/punt (`"I don't know"`, `"as an AI"`, empty), or
  no overlap at all.

### Tasks

Implement `judge(question, response, reference) -> int`:

1. Detect **punts/refusals** in `response`. If found, return `1`.
   Use a fixed phrase list: `["i don't know", "i cannot", "i can't",
   "as an ai", "i'm unable", "i am unable"]` (case-insensitive).
2. If `response` is empty or whitespace-only, return `1`.
3. Otherwise, compute **token overlap F1** between response and
   reference (you may import the F1 logic; do it inline if you
   prefer).
4. Map F1 to a score:
   - `f1 >= 0.85` → 5
   - `f1 >= 0.60` → 4
   - `f1 >= 0.30` → 3
   - `f1 > 0.00`  → 2
   - `f1 == 0.00` → 1
5. Return the int. `question` is not used in this rule-based judge,
   but it is part of the signature so calling code can swap in a
   real LLM judge later.

### Hints

- Lowercase before string match: `"As an AI"` vs `"as an ai"`.
- Token-level F1 is the same multiset overlap as kata
  `exact-match-and-f1`. Reuse the formula.
- Don't over-engineer. The point is to have a *legible* baseline
  judge.

## Prerequisites

- Kata: exact-match-and-f1 (for the F1 formula).

## References

- Appendix F.5 (build-reasoning) — listing F.7 shows the real rubric
  prompt this kata mocks.
- Zheng et al. (2023). "Judging LLM-as-a-Judge with MT-Bench and
  Chatbot Arena." — the canonical paper on judge biases.

## Teaching Approach

**Strong Socratic.** This kata is about a single dangerous insight:
**LLM judges have biases**. The mock is the trojan horse for that
discussion.

### Socratic prompts

- "You want to evaluate 1000 responses. You use GPT-4 as the judge.
  Name three biases this introduces."
  - **Verbosity bias**: longer responses tend to score higher even
    when wrong. (Zheng 2023.)
  - **Position bias**: in pairwise comparisons, the first response
    is preferred ~60% of the time independent of content.
  - **Self-preference / model bias**: GPT-4 prefers GPT-4-style
    output; Claude prefers Claude-style. You're not measuring
    quality, you're measuring style-similarity to the judge.
  - **Sycophancy / agreement bias**: the judge agrees with assertive
    or confident responses even when they're wrong.
  - **Template bias**: responses that match the judge's preferred
    format (headers, numbered lists, markdown) score higher.
- "Your mock returns 5 for high token overlap. What does that *fail*
  to catch?" (Paraphrase scores low — the response could be
  semantically identical with different vocabulary. This is exactly
  why real judges are LLMs, not rule-based: the LLM understands
  paraphrase.)
- "If the response is a flat refusal, you return 1. Is that the
  right call?" (Sometimes 'I don't know' is the correct safety
  behavior. A judge that scores all refusals as 1 trains the model
  *away* from calibrated uncertainty.)
- "A judge gives model A and model B both an average score of 4.2
  over 1000 prompts. What evaluation question can you NOT answer
  from this number alone?" (Are the scores correlated with task
  difficulty? Are the same prompts hard for both? Is the gap
  statistically significant? Means without variance hide everything.)
- "When would you trust an LLM judge more than your rule-based one?"
  (Long-form generation, paraphrase tolerance, semantic equivalence.
  Never trust either for safety-critical use.)

### Common pitfalls

1. **Forgetting case-insensitive punt detection** — `"As an AI"`
   slips past `"as an ai"` without `.lower()`.
2. **Refusal detection via substring** — `"as an ai"` is in
   `"as an aircraft engineer..."`. Acceptable for this kata, but
   call it out: real refusal detection is its own hard problem.
3. **Hardcoding score 5 when response == reference** — fine, but
   make sure the F1 path also returns 5 for high overlap; otherwise
   paraphrases get 2.

## On Completion

### Insight

This rule-based judge is what every LLM judge becomes after you
inspect its prompt enough times: a (more sophisticated) overlap +
rubric mapper. The "magic" of GPT-4 judging isn't a different
algorithm — it's the same idea executed with paraphrase tolerance
and rubric understanding. *The biases (verbosity, position,
self-preference, sycophancy) are intrinsic to using an LLM in this
role and don't go away with a better model.*

### Bridge

Next: **win-rate-with-ci** — you have a judge. Now you need to
compare two models and report a result with a confidence interval,
not just "A wins 60% of the time."
