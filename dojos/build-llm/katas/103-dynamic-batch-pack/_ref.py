"""dynamic-batch-pack — reference solution."""


def pack_to_budget(requests: list[int], budget: int) -> list[list[int]]:
    batches: list[list[int]] = []
    sums: list[int] = []
    for req in requests:
        if req > budget:
            raise ValueError(f"Request of {req} tokens exceeds budget {budget}")
        placed = False
        for i in range(len(batches)):
            if sums[i] + req <= budget:
                batches[i].append(req)
                sums[i] += req
                placed = True
                break
        if not placed:
            batches.append([req])
            sums.append(req)
    return batches
