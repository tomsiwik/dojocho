"""padding-waste — Static batch padding waste.

When you batch prompts of different lengths, PyTorch tensors have to be
rectangular. So every shorter row gets padded up to the longest row in
the batch. Those pad tokens still cost compute and KV-cache memory —
the model attends over them, even if a padding mask zeroes their
contribution at the end.

Implement `static_batch_pad(requests)` to report how much you pay.

Given a list of token counts (one per request), return:
  - total_tokens: max(requests) * len(requests)  — the slots you allocate
  - wasted_tokens: total_tokens - sum(requests)  — the pad slots

For example, requests = [10, 100] in one batch costs 200 slots,
90 of which are padding. That's 45% waste, and it's why people who
serve LLMs reach for length-bucketing or continuous batching.
"""


def static_batch_pad(requests: list[int]) -> tuple[int, int]:
    """Return (total_tokens, wasted_tokens) for a single padded batch.

    `requests` is a list of token counts (one per request in the batch).
    Pad every request up to max(requests).
    """
    ...  # implement me
