# SENSEI — dynamic-batch-pack

## Briefing

### Goal

Replace one giant padded rectangle with a sequence of batches under a
fixed token budget. This is the simplest non-naive batching policy,
and it's the structural ancestor of every "dynamic batching" feature
in modern inference servers.

### Tasks

1. Implement `pack_to_budget(requests, budget)` using **first-fit**:
   for each request, drop it into the first existing batch whose
   current total + request ≤ budget. Open a new batch if none fits.
2. Raise `ValueError` if any single request exceeds `budget`.

### Hints

- Walk requests once; maintain `list[list[int]]` of batches and look
  up each batch's running sum (small, so recomputing is fine).
- First-fit ≠ best-fit. The tests pin the *first-fit* order. If
  `test_first_fit_order` fails, you may be using best-fit by accident.
- Edge cases: empty input, exact fit, oversize request.

## Prerequisites

- `padding-waste` kata (motivation).
- Appendix E §E.2.

## References

- Bin-packing, first-fit decreasing: classical OR result that FF gets
  within 11/9 OPT.
- vLLM's scheduler uses a token-budget-bounded continuous batch.

## Teaching Approach

**Method: Use-Modify-Create + Socratic.** Start by reading the
first-fit description; ask the student to trace `[80, 30, 15]`
on paper. Then code.

### Socratic prompts

- "You just halved padding waste by splitting into multiple batches.
  What did it cost?" (Hint: latency variance — a request that lands
  in the *second* batch waits for the first to finish.)
- "Why first-fit and not best-fit? What does best-fit buy you, and
  what does it cost?" (Slightly tighter packing; O(n log n) sorting
  and worse for streaming.)
- "What happens at the boundary between batches? Does the GPU keep
  busy, or is there a bubble?" (Bubble — and continuous batching is
  the fix.)
- "If your budget is 4096 tokens and a request is 5000 tokens, what
  should `pack_to_budget` do?" (Raise — *truncation* is a separate
  policy decision.)

### Common pitfalls

1. **Always opening a new batch** — appending to a fresh list instead
   of scanning existing batches. `test_first_fit_order` catches this.
2. **Forgetting to raise on oversize** — silently splitting an oversize
   request would corrupt the token-count contract.
3. **Mutating requests during iteration** — keep input pristine; build
   batches separately.

## On Completion

### Insight

You wrote the same algorithm that lives at the heart of vLLM's
scheduler, minus the KV-cache budgeting and preemption. The
generalization to GPU serving is: replace "token count" with "KV-cache
pages needed" and "budget" with "free pages in HBM".

### Bridge

Next: `continuous-batching-sim`. So far you packed all known requests
into batches up-front. But real requests arrive over time. What if you
admit new requests *every decode step*, instead of waiting for a full
batch to finish?
