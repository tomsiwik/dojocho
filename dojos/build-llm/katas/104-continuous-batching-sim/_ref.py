"""continuous-batching-sim — reference solution."""


def simulate(
    arrivals: list[tuple[int, int]],
    budget: int,
    n_steps: int,
) -> dict:
    # Tag each request with its input index, sort the queue by
    # (arrival_time, index) so admission is FIFO.
    queue = sorted(
        [(at, n, i) for i, (at, n) in enumerate(arrivals)],
        key=lambda x: (x[0], x[2]),
    )
    active: list[list[int]] = []  # [arrival_time, remaining_tokens, index]
    latencies: list[int] = []
    max_active = 0

    for step in range(n_steps):
        # Admit step.
        i = 0
        while i < len(queue) and len(active) < budget:
            at, n, idx = queue[i]
            if at <= step:
                active.append([at, n, idx])
                queue.pop(i)
            else:
                # Queue is sorted by arrival_time, so we can stop.
                break
        max_active = max(max_active, len(active))

        # Process step: advance every active request by one token.
        still_active = []
        for at, remaining, idx in active:
            remaining -= 1
            if remaining <= 0:
                latencies.append(step - at + 1)
            else:
                still_active.append([at, remaining, idx])
        active = still_active

    total_completed = len(latencies)
    mean_latency = sum(latencies) / total_completed if total_completed else 0.0
    return {
        "total_completed": total_completed,
        "mean_latency": mean_latency,
        "max_active": max_active,
    }
