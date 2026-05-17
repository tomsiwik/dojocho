"""Reference solution for llm-judge-mock."""

import re
import string
from collections import Counter


_PUNTS = (
    "i don't know",
    "i cannot",
    "i can't",
    "as an ai",
    "i'm unable",
    "i am unable",
)
_PUNCT_TABLE = str.maketrans("", "", string.punctuation)


def _tokenize(text: str) -> list[str]:
    text = text.lower().translate(_PUNCT_TABLE)
    return text.split()


def _f1(a: list[str], b: list[str]) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    ca, cb = Counter(a), Counter(b)
    num_same = sum((ca & cb).values())
    if num_same == 0:
        return 0.0
    p = num_same / len(a)
    r = num_same / len(b)
    return 2 * p * r / (p + r)


def judge(question: str, response: str, reference: str) -> int:
    if not response.strip():
        return 1
    low = response.lower()
    for punt in _PUNTS:
        if punt in low:
            return 1
    f1 = _f1(_tokenize(response), _tokenize(reference))
    if f1 >= 0.85:
        return 5
    if f1 >= 0.60:
        return 4
    if f1 >= 0.30:
        return 3
    if f1 > 0.0:
        return 2
    return 1
