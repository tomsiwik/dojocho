from typing import Iterator


def build_vocab(tokens, include_unk=True):
    unique = sorted(set(tokens))
    if include_unk:
        return {"<unk>": 0, **{tok: i + 1 for i, tok in enumerate(unique)}}
    return {tok: i for i, tok in enumerate(unique)}


def tokenize_to_ids(text, vocab):
    raw = [w.strip(".,;:!?\n").lower() for w in text.split() if w.strip()]
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
