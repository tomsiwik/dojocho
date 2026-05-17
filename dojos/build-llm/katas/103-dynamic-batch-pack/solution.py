"""dynamic-batch-pack — Greedy token-budget packing.

Padding waste comes from forcing all requests into one rectangle.
A first mitigation: don't. Pack requests into multiple batches under
a fixed token budget instead.

Implement `pack_to_budget(requests, budget)` using a first-fit
greedy strategy:

  - Walk the requests in order.
  - For each request, place it in the first existing batch whose
    current total + request <= budget.
  - If no batch fits, open a new one.

Each request takes its raw token count (no padding model here — we are
budgeting *real* tokens). The point of the kata is the packing
discipline; the padding cost you'd inherit on top is a separate
discussion (see `padding-waste`).

A request bigger than `budget` is a programmer error; raise
`ValueError`.
"""


def pack_to_budget(requests: list[int], budget: int) -> list[list[int]]:
    """Pack `requests` (token counts) into batches; return the list
    of batches. Each batch is a list of the token counts it received,
    preserving input order within each batch.
    """
    ...  # implement me
