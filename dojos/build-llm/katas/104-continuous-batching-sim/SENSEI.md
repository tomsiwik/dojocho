# SENSEI — continuous-batching-sim

## Briefing

### Goal

Simulate continuous batching — the scheduling discipline behind
modern LLM serving systems (Orca, vLLM, TGI). Static batching waits
for a whole batch to finish; continuous batching admits a new request
the moment a slot frees up. The active set breathes.

### Tasks

1. Implement `simulate(arrivals, budget, n_steps)` with this per-step
   loop:
     a. Admit any waiting request (arrival_time ≤ step) into the
        active set, up to `budget` active requests. Admit in arrival
        order, ties by input index.
     b. Each active request advances by 1 token. Requests that hit
        their token target complete this step. Latency =
        `completion_step - arrival_time + 1`.
2. Return `{total_completed, mean_latency, max_active}`. If nothing
   completed, `mean_latency` is 0.0.

### Hints

- Maintain three structures: a queue of not-yet-admitted requests,
  the active set (with remaining tokens), and a list of completed
  latencies.
- `max_active` is measured *after* admission, *before* processing
  removes anyone — this is the peak resource pressure.
- Don't admit requests whose arrival_time > current step.
- Watch the latency formula: if a request arrives at step 0 and
  finishes at step 0 (1-token request), latency = 1 step, not 0.

## Prerequisites

- `dynamic-batch-pack` (static packing baseline).
- Appendix E §E.2.

## References

- Yu et al., "Orca: A Distributed Serving System for
  Transformer-Based Generative Models" (OSDI 2022).
- vLLM scheduler source: `vllm/core/scheduler.py`.

## Teaching Approach

**Method: Code-reading + Socratic.** The algorithm is short but the
*semantics* matter. Have the student trace `test_continuous_admission`
by hand on paper, step by step, before writing code.

### Socratic prompts

- "Static batching admits a fixed set, runs to completion, repeats.
  What metric does that maximize? What metric does it hurt?"
  (Throughput up; tail latency disastrous.)
- "Continuous batching admits new requests every step. What's the
  binding bottleneck on `budget`?" (KV-cache memory in HBM — every
  active request holds onto its growing key/value tensors.)
- "If `budget` is too high, what fails?" (You allocate KV cache for
  more requests than HBM holds — OOM.)
- "Look at `test_continuous_admission`. Trace what static batching
  would have given req3 for latency. Compare." (Static: 6, blocking
  on req2. Continuous: 2.)

### Common pitfalls

1. **Off-by-one in latency** — completing at step 0 for a 1-token
   request arriving at step 0 should give latency 1, not 0.
2. **Admitting after processing** — admit first, then process. Or
   you'll fail `max_active` checks.
3. **FIFO vs. priority** — these tests assume FIFO by (arrival_time,
   input_index). Don't reorder.
4. **Counting `max_active` at wrong moment** — measure right after
   admission, before completion. Some students measure end-of-step
   (after completions remove rows) and miss the peak.

## On Completion

### Insight

You just modeled the core scheduling loop of every modern LLM serving
system. The simulation is intentionally coarse (one token = one unit
of work), but the policy — admit on free slot, process active set,
evict on completion — is real. The thing that limits how high `budget`
can go is not compute. It's KV-cache memory.

### Bridge

Next: `paged-kv-cache`. The KV cache is a per-request, per-layer
buffer that *grows* one row per token. Allocating it contiguously
wastes memory the same way static batching wastes compute. The fix is
the same one operating systems use for RAM: paging.
