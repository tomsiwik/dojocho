"""Tests for truncation-strategies."""

import pytest


def words(m):
    """Cheap word-count stand-in for a real tokenizer."""
    return len(m["content"].split())


@pytest.fixture
def chat():
    """A system message + 10 user/assistant turns of 10 words each."""
    msgs = [{"role": "system", "content": "system " * 5}]  # 5 words
    for i in range(10):
        role = "user" if i % 2 == 0 else "assistant"
        msgs.append({"role": role, "content": f"turn{i} " * 10})  # 10 words
    return msgs


# ---------- truncate_left ----------


def test_truncate_left_shrinks(solution, chat):
    out = solution.truncate_left(chat, max_tokens=30, count_fn=words)
    assert sum(words(m) for m in out) <= 30


def test_truncate_left_preserves_system(solution, chat):
    out = solution.truncate_left(chat, max_tokens=30, count_fn=words)
    assert out[0]["role"] == "system"
    assert out[0]["content"] == chat[0]["content"]


def test_truncate_left_keeps_recent(solution, chat):
    """Left truncation should keep the *most recent* non-system msgs."""
    out = solution.truncate_left(chat, max_tokens=30, count_fn=words)
    # Whatever non-system messages remain should appear at the end of `chat`.
    non_sys = [m for m in out if m["role"] != "system"]
    if non_sys:
        assert non_sys == chat[-len(non_sys):]


def test_truncate_left_noop_when_under_budget(solution, chat):
    out = solution.truncate_left(chat, max_tokens=10_000, count_fn=words)
    assert out == chat


# ---------- truncate_keep_recent ----------


def test_truncate_keep_recent_shrinks(solution, chat):
    out = solution.truncate_keep_recent(
        chat, max_tokens=40, count_fn=words, n_recent=3
    )
    assert sum(words(m) for m in out) <= 40


def test_truncate_keep_recent_preserves_system(solution, chat):
    out = solution.truncate_keep_recent(
        chat, max_tokens=40, count_fn=words, n_recent=3
    )
    assert out[0]["role"] == "system"


def test_truncate_keep_recent_caps_at_n(solution, chat):
    out = solution.truncate_keep_recent(
        chat, max_tokens=10_000, count_fn=words, n_recent=3
    )
    # System + at most 3 recent messages.
    non_sys = [m for m in out if m["role"] != "system"]
    assert len(non_sys) <= 3
    # And those should be the tail of chat.
    assert non_sys == chat[-len(non_sys):]


# ---------- truncate_summarize ----------


def fake_summarizer(msgs):
    """Deterministic 3-word summary regardless of input length."""
    return "summary of history"


def test_truncate_summarize_shrinks(solution, chat):
    before = sum(words(m) for m in chat)
    out = solution.truncate_summarize(
        chat, max_tokens=40, count_fn=words, summarizer=fake_summarizer
    )
    after = sum(words(m) for m in out)
    assert after < before
    assert after <= 40


def test_truncate_summarize_preserves_original_system(solution, chat):
    out = solution.truncate_summarize(
        chat, max_tokens=40, count_fn=words, summarizer=fake_summarizer
    )
    assert out[0] == chat[0]


def test_truncate_summarize_inserts_summary(solution, chat):
    out = solution.truncate_summarize(
        chat, max_tokens=40, count_fn=words, summarizer=fake_summarizer
    )
    # A summary message should appear (role=system, content from summarizer).
    summary_msgs = [
        m for m in out
        if m["role"] == "system" and "summary" in m["content"].lower()
    ]
    assert len(summary_msgs) >= 1


def test_truncate_summarize_noop_when_under_budget(solution, chat):
    out = solution.truncate_summarize(
        chat, max_tokens=10_000, count_fn=words, summarizer=fake_summarizer
    )
    assert out == chat
