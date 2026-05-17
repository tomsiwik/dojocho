"""truncation-strategies — Fit a growing conversation into a budget.

Real LLMs have a fixed context window. As a chat grows the message list
can exceed it, and you must drop or compress old content. Three classic
strategies:

  * `truncate_left`        — drop oldest turns; cheap, loses context
  * `truncate_keep_recent` — always keep the last N turns; predictable
  * `truncate_summarize`   — replace the dropped chunk with a summary

The system message is always preserved — it carries the persona/rules
and the model relies on it.

Each function takes a `count_fn(message_dict) -> int` so we don't have
to depend on a real tokenizer in this kata. Reasonable choice for tests:
`count_fn = lambda m: len(m["content"].split())`.
"""

from typing import Callable

Message = dict
CountFn = Callable[[Message], int]
Summarizer = Callable[[list[Message]], str]


def truncate_left(
    messages: list[Message],
    max_tokens: int,
    count_fn: CountFn,
) -> list[Message]:
    """Drop the oldest non-system messages until the total fits.

    Returns a new list. Preserves the leading system message (if any)
    and the relative order of what remains.
    """
    ...  # implement me


def truncate_keep_recent(
    messages: list[Message],
    max_tokens: int,
    count_fn: CountFn,
    n_recent: int,
) -> list[Message]:
    """Keep the system message + the last `n_recent` messages.

    If that combination is still over `max_tokens`, drop the oldest of
    the kept recent messages until it fits. Returns a new list.
    """
    ...  # implement me


def truncate_summarize(
    messages: list[Message],
    max_tokens: int,
    count_fn: CountFn,
    summarizer: Summarizer,
) -> list[Message]:
    """Replace dropped middle messages with one `system`-role summary.

    Iteratively peel messages off the front (after the original system
    message) and feed them to `summarizer`. The returned list has the
    shape:

        [original_system, {"role": "system", "content": summary}, ...recent...]

    until the total is <= `max_tokens`. If `summarizer` cannot produce
    a small-enough digest, this function may still exceed the budget;
    that is acceptable — the tests only require shrinking, not a hard
    cap.
    """
    ...  # implement me
