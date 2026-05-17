# SENSEI — paged-kv-cache

## Briefing

### Goal

Implement a page allocator for a KV cache. The cache stores
keys/values per token per layer per request. Paging — splitting the
cache into fixed-size pages and handing them out one at a time —
solves the same problem that OS virtual memory solves for RAM:
internal/external fragmentation, and the inability to predict how
much each request will need.

### Tasks

1. Implement `PagedKVCache(page_size, n_pages)`.
2. `allocate(n_tokens)` returns `list[int]` of page indices,
   `ceil(n_tokens / page_size)` of them. OOM raises `MemoryError`.
3. `free(page_indices)` returns pages to the free pool.
   Double-free or free-never-allocated raises `ValueError`.
4. Hand out the lowest free index first.

### Hints

- Track free pages as a `set[int]`. Lowest-first means
  `min(self.free)` (or keep a sorted structure if you want — for the
  test sizes either is fine).
- `math.ceil(n / page_size)` or `(n + page_size - 1) // page_size`.
- The test `test_no_fragmentation_after_interleaved_free` is the
  punchline: paging works *because* pages don't have to be
  contiguous.

## Prerequisites

- `continuous-batching-sim` — explains *why* you need this.
- Optional: skim the PagedAttention paper (arxiv 2309.06180), §3.

## References

- Kwon et al., "Efficient Memory Management for Large Language Model
  Serving with PagedAttention" (SOSP 2023).
- Operating Systems: Three Easy Pieces, ch. 18 ("Paging:
  Introduction").

## Teaching Approach

**Method: Strong Socratic.** The student already wrote a malloc-like
free pool in CS undergrad. This kata is a chance to *transfer* that
intuition to ML infrastructure. Lead with analogies before code.

### Socratic prompts

- "Why is the KV cache like a malloc-style allocator? What's the
  analog of a `malloc` call? What's the analog of `free`?"
  (Allocate: new request admitted, or existing request grows past
  a page boundary. Free: request completes / is evicted.)
- "What problem does paging solve that contiguous allocation
  creates?" (External fragmentation. Worst-case over-allocation per
  request.)
- "An OS uses pages so that a process's virtual address space can be
  scattered across physical RAM. What's the LLM analogue?" (A
  request's KV vectors are logically a sequence, but physically
  scattered across HBM pages.)
- "If you allocate contiguous blocks per request with size
  `max_seq_len`, what's your average HBM utilization on a workload
  with mean length much less than max?" (Terrible. This is the
  static-padding problem all over again.)
- After it works: "vLLM picks `page_size=16` tokens. Why not 1? Why
  not 1024?" (Too small: per-page bookkeeping dominates. Too large:
  internal fragmentation in the last page of every request.)

### Common pitfalls

1. **Using a list instead of a set** — `pages.remove(i)` is O(n);
   for the test sizes it's fine, but the data structure that matches
   the semantics is a set (or a sorted container).
2. **Not validating `free` input** — silently ignoring double-free
   would mask real bugs in the caller.
3. **Returning page indices in a non-deterministic order from
   `allocate`** — the tests pin "lowest free first".
4. **Treating `allocate(0)` as an error** — it's legal; return `[]`.
5. **OOM raising `Exception` instead of `MemoryError`** — `MemoryError`
   is the contract; the caller might want to catch only that.

## On Completion

### Insight

You wrote, in 30 lines, the same data structure that lets vLLM serve
order-of-magnitude more concurrent requests than a contiguous
allocator. The structural insight is universal: when you don't know
how big each allocation will be, *pre-commit fixed-size chunks and
let users compose them*. OS page tables, filesystem blocks, database
pages, GPU memory pools, and KV caches all share this discipline.

### Bridge

This is the last kata of Appendix E. You've now traced the full
arc:
- `padding-waste`: the compute-side waste of static batching.
- `dynamic-batch-pack`: bucket by budget, but you still bubble between
  batches.
- `continuous-batching-sim`: admit every step, but now memory binds.
- `paged-kv-cache`: how memory stops binding.

You're now equipped to read the vLLM source code without flinching.
