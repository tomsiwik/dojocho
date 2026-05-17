"""Reference solution for truncation-strategies."""

from typing import Callable

Message = dict
CountFn = Callable[[Message], int]
Summarizer = Callable[[list[Message]], str]


def _total(messages, count_fn):
    return sum(count_fn(m) for m in messages)


def _has_system(messages):
    return bool(messages) and messages[0].get("role") == "system"


def truncate_left(messages, max_tokens, count_fn):
    if _total(messages, count_fn) <= max_tokens:
        return list(messages)

    has_sys = _has_system(messages)
    system = [messages[0]] if has_sys else []
    rest = list(messages[1:]) if has_sys else list(messages)

    while rest and _total(system + rest, count_fn) > max_tokens:
        rest.pop(0)
    return system + rest


def truncate_keep_recent(messages, max_tokens, count_fn, n_recent):
    has_sys = _has_system(messages)
    system = [messages[0]] if has_sys else []
    rest = list(messages[1:]) if has_sys else list(messages)

    recent = rest[-n_recent:] if n_recent > 0 else []
    while recent and _total(system + recent, count_fn) > max_tokens:
        recent.pop(0)
    return system + recent


def truncate_summarize(messages, max_tokens, count_fn, summarizer):
    if _total(messages, count_fn) <= max_tokens:
        return list(messages)

    has_sys = _has_system(messages)
    system = [messages[0]] if has_sys else []
    rest = list(messages[1:]) if has_sys else list(messages)

    dropped = []
    # Peel from the front; after each peel, build summary and check budget.
    while rest:
        dropped.append(rest.pop(0))
        summary_msg = {"role": "system", "content": summarizer(dropped)}
        candidate = system + [summary_msg] + rest
        if _total(candidate, count_fn) <= max_tokens:
            return candidate

    # Nothing left to peel — return system + final summary.
    summary_msg = {"role": "system", "content": summarizer(dropped)}
    return system + [summary_msg]
