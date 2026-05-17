# SENSEI — padding-waste

## Briefing

### Goal

Quantify the compute you throw away when you naively batch prompts of
different lengths. Appendix E explains *why* padding exists; this kata
makes the cost visceral.

### Tasks

1. Implement `static_batch_pad(requests)` — given a list of token
   counts, return `(total_tokens, wasted_tokens)` where total slots is
   `max * len`, and wasted is the gap between that rectangle and the
   sum of real tokens.

### Hints

- Two lines of Python. Don't over-engineer.
- `max(requests)` and `sum(requests)` are all you need.
- Decide what `[]` should do — `max([])` raises, which is fine.

## Prerequisites

- Appendix E read through §E.3 (padding and attention masks).

## References

- Raschka build-reasoning appendix E §E.2–E.3.

## Teaching Approach

**Method: Demo + Socratic.** This kata is so short that the *insight*
is the whole point. Run it on a few realistic distributions before
asking the student to write the function.

### Socratic prompts

- "What fraction of compute did you throw away on `[10, 100]`? On
  `[10, 10, 10, 100]`? What pattern do you see?"
- "Production serving sees prompt lengths spanning 50 to 4000 tokens.
  What does that imply for a single rectangular batch?"
- "Two strategies to cut the waste: (a) sort and bucket by length,
  (b) admit new requests every step. Both have a name. What are they?"
  (Answers: length-bucketing; continuous batching — next kata.)
- After it works: "If you only pay for the real tokens, why does the
  GPU still spend time on the pad tokens?"

### Common pitfalls

1. **Forgetting the rectangle** — students compute `sum(requests)` and
   wonder where the waste comes from. The point is the rectangle is
   `max * len`, not `sum`.
2. **Confusing total with wasted** — total includes the real tokens.
   Waste is only the padding cells.

## On Completion

### Insight

Static batching is the simplest possible strategy, and on a realistic
prompt-length distribution it leaves 30–80% of your GPU FLOPs on the
floor. Every serving system you've heard of — vLLM, TGI, TensorRT-LLM —
exists in large part to fix this one accounting problem.

### Bridge

Next: `dynamic-batch-pack` — your first mitigation. Instead of one
rectangle, pack requests into multiple batches under a token budget.
You'll halve the padding waste, but the cost shows up somewhere else.
