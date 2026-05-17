"""paged-kv-cache — reference solution."""

import math


class PagedKVCache:
    def __init__(self, page_size: int, n_pages: int):
        self.page_size = page_size
        self.n_pages = n_pages
        self.free_pages: set[int] = set(range(n_pages))

    def allocate(self, n_tokens: int) -> list[int]:
        if n_tokens == 0:
            return []
        n_needed = math.ceil(n_tokens / self.page_size)
        if n_needed > len(self.free_pages):
            raise MemoryError(
                f"Need {n_needed} pages, only {len(self.free_pages)} free"
            )
        # Lowest indices first; sorting the free set is O(n log n) but
        # the test pool is tiny.
        picked = sorted(self.free_pages)[:n_needed]
        for p in picked:
            self.free_pages.remove(p)
        return picked

    def free(self, page_indices: list[int]) -> None:
        for p in page_indices:
            if p in self.free_pages or not (0 <= p < self.n_pages):
                raise ValueError(f"Page {p} is not currently allocated")
        for p in page_indices:
            self.free_pages.add(p)
