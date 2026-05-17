"""Recover individual _ref.py files from the broken _validate_references.py.

Parses by text (not Python AST) since the file has syntax errors when kata
code contains triple quotes. Splits on the unique slug-header pattern.

Run once:
    uv run --no-project --python 3.12 python _recover_refs.py
"""
import re
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "_validate_references.py"
KATAS = HERE / "katas"

text = SRC.read_text(encoding="utf-8")

# Each entry looks like:
#     "<slug>": r"""\n<code>\n""",
# We split on the slug header pattern.
ENTRY_RE = re.compile(r'    "(\d{3}-[a-z0-9-]+)":\s*r"""\n')

matches = list(ENTRY_RE.finditer(text))
print(f"Found {len(matches)} entry headers")

recovered = 0
for i, m in enumerate(matches):
    slug = m.group(1)
    start = m.end()
    # End is at the next entry header, or the closing `}` of REFERENCES.
    end = matches[i + 1].start() if i + 1 < len(matches) else text.find("}\n", start)
    chunk = text[start:end]
    # Strip the trailing `""",` and any trailing whitespace.
    chunk = re.sub(r'\s*"""\s*,?\s*$', "", chunk, flags=re.DOTALL).rstrip() + "\n"

    kata_dir = KATAS / slug
    if not kata_dir.is_dir():
        print(f"  ⚠ {slug}: kata dir missing — skipping")
        continue

    (kata_dir / "_ref.py").write_text(chunk, encoding="utf-8")
    recovered += 1

print(f"\nRecovered {recovered} _ref.py files")

# Also stash inline ch1 references into _ref.py for uniformity
INLINE_CH1 = {
    "001-bigram-language-model": '''
from collections import Counter, defaultdict


def tokenize(text: str) -> list[str]:
    return [w.strip(".,;:!?\\n").lower() for w in text.split() if w.strip()]


def build_bigrams(tokens: list[str]) -> dict[str, Counter]:
    bigrams: dict[str, Counter] = defaultdict(Counter)
    for prev, nxt in zip(tokens, tokens[1:]):
        bigrams[prev][nxt] += 1
    return bigrams


def next_word(bigrams: dict[str, Counter], word: str) -> str:
    if word not in bigrams:
        return "<unknown>"
    return bigrams[word].most_common(1)[0][0]
''',

    "002-autoregressive-generation": '''
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
''',

    "003-encoder-vs-decoder": '''
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
''',

    "004-training-pairs-from-text": '''
from typing import Iterator


def build_vocab(tokens, include_unk=True):
    unique = sorted(set(tokens))
    if include_unk:
        return {"<unk>": 0, **{tok: i + 1 for i, tok in enumerate(unique)}}
    return {tok: i for i, tok in enumerate(unique)}


def tokenize_to_ids(text, vocab):
    raw = [w.strip(".,;:!?\\n").lower() for w in text.split() if w.strip()]
    result: list[int] = []
    for w in raw:
        if w in vocab:
            result.append(vocab[w])
        elif "<unk>" in vocab:
            result.append(vocab["<unk>"])
        else:
            raise KeyError(w)
    return result


def sliding_window_pairs(ids, max_length, stride=1):
    last_start = len(ids) - max_length - 1
    for i in range(0, last_start + 1, stride):
        inp = ids[i : i + max_length]
        tgt = ids[i + 1 : i + 1 + max_length]
        yield inp, tgt
''',
}

for slug, code in INLINE_CH1.items():
    kata_dir = KATAS / slug
    if kata_dir.is_dir():
        (kata_dir / "_ref.py").write_text(code.strip() + "\n", encoding="utf-8")
        print(f"  + {slug} (inline ch1)")

# Delete the broken file
SRC.unlink()
print("\nDeleted broken _validate_references.py")
