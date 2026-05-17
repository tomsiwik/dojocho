"""continuous-batching-sim — Continuous batching at step granularity.

Static batching waits for a full batch to finish before starting the
next. Continuous batching (Orca, vLLM) admits new requests at every
decode step and evicts finished ones immediately. The active batch
breathes — its size changes step by step.

You will simulate this at very coarse granularity: one step processes
one token per active request. Requests arrive over time and have known
token counts. A token budget limits how many active requests there can
be at once.

Implement `simulate(arrivals, budget, n_steps)`:

  - `arrivals`: list of `(arrival_time, n_tokens)` tuples. The request
    with index `i` arrives at step `arrivals[i][0]` and needs
    `arrivals[i][1]` tokens of work to finish.
  - `budget`: maximum number of active requests at any one time.
  - `n_steps`: simulation runs for steps 0, 1, ..., n_steps - 1.

Each step (in order):
  1. Admit waiting requests that have arrived (arrival_time <= step)
     into the active set, up to `budget`. Admit in arrival order; ties
     break by input order (request index).
  2. Every active request advances by 1 token. Requests that hit their
     token count are completed THIS step. Their latency is
     `(completion_step - arrival_time + 1)`.

Return a dict with three keys:
  - `total_completed` (int): number of requests fully processed.
  - `mean_latency` (float): mean latency of completed requests. If
    none completed, return 0.0.
  - `max_active` (int): the largest number of active requests observed
    in any step (after admission, before completion).
"""


def simulate(
    arrivals: list[tuple[int, int]],
    budget: int,
    n_steps: int,
) -> dict:
    """Simulate continuous batching; return throughput/latency stats."""
    ...  # implement me
