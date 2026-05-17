import random
from collections import Counter


def sample_next(bigrams, word, temperature=0.0, rng=None):
    if word not in bigrams or not bigrams[word]:
        return "<end>"
    if temperature <= 0.0:
        return bigrams[word].most_common(1)[0][0]
    rng = rng or random.Random()
    followers, counts = zip(*bigrams[word].items())
    weights = [c ** (1.0 / temperature) for c in counts]
    return rng.choices(followers, weights=weights, k=1)[0]


def generate(bigrams, seed, n_tokens, temperature=0.0, rng_seed=0):
    rng = random.Random(rng_seed)
    out = [seed]
    for _ in range(n_tokens - 1):
        nxt = sample_next(bigrams, out[-1], temperature=temperature, rng=rng)
        if nxt == "<end>":
            break
        out.append(nxt)
    return out
