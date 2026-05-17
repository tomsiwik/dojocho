"""paged-kv-cache — Page allocator for KV cache.

The KV cache stores keys and values for every previous token, every
layer, every request. Naively, you allocate a contiguous buffer
[max_seq_len, hidden_dim] per request — but max_seq_len is a worst
case, and most requests don't fill it. You pay the worst case for
every request you serve. Sound familiar? (See `padding-waste`.)

The fix is paging, borrowed straight from operating systems. Split the
cache into fixed-size pages and hand them out one at a time as a
request grows. A request becomes a *list of page indices*, not a
contiguous block. The same idea underpins vLLM's PagedAttention
(arxiv 2309.06180).

Implement `PagedKVCache(page_size, n_pages)`:

  - `allocate(n_tokens)` returns a list of page indices sufficient
    to hold `n_tokens`. Number of pages needed is
    `ceil(n_tokens / page_size)`. Raises `MemoryError` if there
    aren't enough free pages.
  - `free(page_indices)` returns those pages to the pool. Calling
    `free` on a page that's already free is a programmer error;
    raise `ValueError`.

You do not need to store the page *contents* — this kata is the
allocator, not the cache. Page indices are integers in
`range(n_pages)`. Hand them out in ascending order from the free
pool (lowest free index first).
"""


class PagedKVCache:
    def __init__(self, page_size: int, n_pages: int):
        ...  # implement me

    def allocate(self, n_tokens: int) -> list[int]:
        """Return a list of page indices for `n_tokens` tokens."""
        ...  # implement me

    def free(self, page_indices: list[int]) -> None:
        """Return `page_indices` to the free pool."""
        ...  # implement me
