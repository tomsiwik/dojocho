from collections import Counter, defaultdict


def tokenize(text: str) -> list[str]:
    return [w.strip(".,;:!?\n").lower() for w in text.split() if w.strip()]


def build_bigrams(tokens: list[str]) -> dict[str, Counter]:
    bigrams: dict[str, Counter] = defaultdict(Counter)
    for prev, nxt in zip(tokens, tokens[1:]):
        bigrams[prev][nxt] += 1
    return bigrams


def next_word(bigrams: dict[str, Counter], word: str) -> str:
    if word not in bigrams:
        return "<unknown>"
    return bigrams[word].most_common(1)[0][0]
