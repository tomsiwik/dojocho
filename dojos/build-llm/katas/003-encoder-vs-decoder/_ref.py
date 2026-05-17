from collections import Counter, defaultdict


def build_directional_bigrams(tokens):
    left = defaultdict(Counter)
    right = defaultdict(Counter)
    for prev, nxt in zip(tokens, tokens[1:]):
        right[prev][nxt] += 1
        left[nxt][prev] += 1
    return left, right


def predict_next(right, word):
    if word not in right or not right[word]:
        return "<unknown>"
    return right[word].most_common(1)[0][0]


def fill_blank(sentence, left, right):
    blank_idx = sentence.index("___")
    before = sentence[blank_idx - 1] if blank_idx > 0 else None
    after = sentence[blank_idx + 1] if blank_idx + 1 < len(sentence) else None
    candidates: Counter = Counter()
    if before is not None and before in right:
        candidates.update(right[before])
    if after is not None and after in left:
        candidates.update(left[after])
    if not candidates:
        return "<unknown>"
    return candidates.most_common(1)[0][0]
