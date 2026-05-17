"""padding-waste — reference solution."""


def static_batch_pad(requests: list[int]) -> tuple[int, int]:
    max_len = max(requests)
    total = max_len * len(requests)
    wasted = total - sum(requests)
    return total, wasted
