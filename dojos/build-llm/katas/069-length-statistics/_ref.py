"""length-statistics — basic length stats over a batch of model responses.

Accuracy is only half the story for reasoning models. The other half
is **how many tokens** the model spent getting there. A reasoning
model that scores +10% accuracy but writes 5× longer answers costs
roughly 5× more per question to serve.

This kata computes simple length statistics — character lengths, not
tokens — over a list of model responses. (Token-level statistics use
a tokenizer; that's a different kata, in chapter 2 of build-llm.)

Return a dict with:
    n      — count of responses (int)
    mean   — arithmetic mean of len(r) (float)
    min    — shortest length (int)
    max    — longest length (int)
    median — middle value (float; average of two middles when n is even)
    p90    — 90th percentile via linear interpolation between order
             statistics. For a sorted list xs of length n, the rank is
             0.9 * (n - 1); interpolate between xs[floor(rank)] and
             xs[ceil(rank)].

For empty input, return all-zero stats:
    {"n": 0, "mean": 0.0, "min": 0, "max": 0, "median": 0.0, "p90": 0.0}
"""


def length_stats(responses: list[str]) -> dict:
    """Return length statistics for the response strings.

    Examples:
        length_stats(["abc"])           -> n=1, mean=3.0, min=3, max=3, ...
        length_stats(["a", "bb", "ccc"]) -> n=3, mean=2.0, min=1, max=3,
                                            median=2.0, p90 interpolates.
    """
    import math
    import statistics

    n = len(responses)
    if n == 0:
        return {"n": 0, "mean": 0.0, "min": 0, "max": 0, "median": 0.0, "p90": 0.0}

    lengths = sorted(len(r) for r in responses)
    mean = statistics.mean(lengths)
    median = statistics.median(lengths)

    rank = 0.9 * (n - 1)
    lo = math.floor(rank)
    hi = math.ceil(rank)
    if lo == hi:
        p90 = float(lengths[lo])
    else:
        frac = rank - lo
        p90 = lengths[lo] + frac * (lengths[hi] - lengths[lo])

    return {
        "n": n,
        "mean": float(mean),
        "min": lengths[0],
        "max": lengths[-1],
        "median": float(median),
        "p90": float(p90),
    }
