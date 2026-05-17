"""Tests for paged-kv-cache."""

import math

import pytest


def test_allocate_returns_correct_page_count(solution):
    """ceil(n_tokens / page_size) pages."""
    cache = solution.PagedKVCache(page_size=16, n_pages=10)
    pages = cache.allocate(40)  # ceil(40/16) = 3
    assert len(pages) == 3


def test_allocate_exact_multiple(solution):
    cache = solution.PagedKVCache(page_size=16, n_pages=10)
    pages = cache.allocate(32)  # exactly 2 pages
    assert len(pages) == 2


def test_allocate_single_token(solution):
    """Even one token costs one page."""
    cache = solution.PagedKVCache(page_size=16, n_pages=10)
    pages = cache.allocate(1)
    assert len(pages) == 1


def test_allocate_ascending_indices(solution):
    """Pages are handed out lowest free index first."""
    cache = solution.PagedKVCache(page_size=16, n_pages=10)
    pages = cache.allocate(48)  # 3 pages
    assert pages == [0, 1, 2]


def test_distinct_allocations_get_distinct_pages(solution):
    cache = solution.PagedKVCache(page_size=16, n_pages=10)
    a = cache.allocate(32)  # pages 0,1
    b = cache.allocate(32)  # pages 2,3
    assert set(a).isdisjoint(set(b))


def test_oom_when_pool_exhausted(solution):
    """Out of memory raises MemoryError."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    cache.allocate(64)  # uses all 4 pages
    with pytest.raises(MemoryError):
        cache.allocate(1)


def test_oom_when_request_too_big(solution):
    """A single request that exceeds pool capacity OOMs cleanly."""
    cache = solution.PagedKVCache(page_size=16, n_pages=2)
    with pytest.raises(MemoryError):
        cache.allocate(100)  # would need 7 pages, only 2 exist


def test_free_returns_pages_to_pool(solution):
    """Free a request, then allocate again — works."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    a = cache.allocate(64)  # all 4 pages
    cache.free(a)
    b = cache.allocate(64)  # should succeed again
    assert sorted(b) == sorted(a)


def test_free_partial_then_realloc(solution):
    """Free some pages, allocate again, see them come back."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    a = cache.allocate(32)  # pages 0,1
    b = cache.allocate(32)  # pages 2,3
    cache.free(a)
    c = cache.allocate(16)  # ceil(16/16)=1 page; lowest free is 0
    assert c == [0]


def test_double_free_raises(solution):
    """Freeing an already-free page is a bug."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    pages = cache.allocate(32)
    cache.free(pages)
    with pytest.raises(ValueError):
        cache.free(pages)


def test_free_never_allocated_raises(solution):
    """Freeing a page you never allocated is also a bug."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    with pytest.raises(ValueError):
        cache.free([0, 1])


def test_no_fragmentation_after_interleaved_free(solution):
    """The classic paging win: holes in the page pool are just fine.
    A new request can use any free pages regardless of contiguity."""
    cache = solution.PagedKVCache(page_size=8, n_pages=6)
    a = cache.allocate(8)   # page [0]
    b = cache.allocate(8)   # page [1]
    c = cache.allocate(8)   # page [2]
    d = cache.allocate(8)   # page [3]
    cache.free(b)
    cache.free(d)
    # Free pages now: {1, 3, 4, 5}. A 3-page request must succeed
    # even though the free pages are non-contiguous.
    e = cache.allocate(24)  # 3 pages
    assert len(e) == 3
    assert set(e).issubset({1, 3, 4, 5})


def test_zero_tokens(solution):
    """Allocating zero tokens needs zero pages."""
    cache = solution.PagedKVCache(page_size=16, n_pages=4)
    assert cache.allocate(0) == []
