"""Tests for chat-template-qwen."""

import pytest


# --- format: structure ---------------------------------------------------


def test_single_user_message(solution):
    msgs = [{"role": "user", "content": "Hello"}]
    out = solution.format_qwen_chat(msgs)
    assert out == "<|im_start|>user\nHello<|im_end|>\n"


def test_single_assistant_message(solution):
    msgs = [{"role": "assistant", "content": "Hi there"}]
    out = solution.format_qwen_chat(msgs)
    assert out == "<|im_start|>assistant\nHi there<|im_end|>\n"


def test_system_then_user(solution):
    msgs = [
        {"role": "system",  "content": "You are helpful."},
        {"role": "user",    "content": "Hi."},
    ]
    out = solution.format_qwen_chat(msgs)
    expected = (
        "<|im_start|>system\nYou are helpful.<|im_end|>\n"
        "<|im_start|>user\nHi.<|im_end|>\n"
    )
    assert out == expected


def test_multi_turn(solution):
    msgs = [
        {"role": "system",    "content": "You are helpful."},
        {"role": "user",      "content": "Hi."},
        {"role": "assistant", "content": "Hello!"},
        {"role": "user",      "content": "Who are you?"},
        {"role": "assistant", "content": "An AI."},
    ]
    out = solution.format_qwen_chat(msgs)
    expected = (
        "<|im_start|>system\nYou are helpful.<|im_end|>\n"
        "<|im_start|>user\nHi.<|im_end|>\n"
        "<|im_start|>assistant\nHello!<|im_end|>\n"
        "<|im_start|>user\nWho are you?<|im_end|>\n"
        "<|im_start|>assistant\nAn AI.<|im_end|>\n"
    )
    assert out == expected


def test_generation_prompt_appended(solution):
    msgs = [{"role": "user", "content": "Hi."}]
    out = solution.format_qwen_chat(msgs, add_generation_prompt=True)
    expected = (
        "<|im_start|>user\nHi.<|im_end|>\n"
        "<|im_start|>assistant\n"
    )
    assert out == expected


def test_no_generation_prompt_by_default(solution):
    msgs = [{"role": "user", "content": "Hi."}]
    out = solution.format_qwen_chat(msgs)
    assert not out.endswith("<|im_start|>assistant\n")


# --- format: validation --------------------------------------------------


def test_invalid_role_raises(solution):
    with pytest.raises(ValueError):
        solution.format_qwen_chat([{"role": "tool", "content": "x"}])


def test_system_must_be_first(solution):
    """A system message after a user/assistant message is invalid."""
    msgs = [
        {"role": "user",   "content": "Hi."},
        {"role": "system", "content": "Now be terse."},
    ]
    with pytest.raises(ValueError):
        solution.format_qwen_chat(msgs)


def test_empty_messages_ok(solution):
    """Empty list → empty string (or just a generation prompt)."""
    assert solution.format_qwen_chat([]) == ""
    assert (
        solution.format_qwen_chat([], add_generation_prompt=True)
        == "<|im_start|>assistant\n"
    )


# --- parse: round-trip ---------------------------------------------------


def test_round_trip_single(solution):
    msgs = [{"role": "user", "content": "Hello"}]
    formatted = solution.format_qwen_chat(msgs)
    parsed = solution.parse_qwen_chat(formatted)
    assert parsed == msgs


def test_round_trip_multi(solution):
    msgs = [
        {"role": "system",    "content": "You are helpful."},
        {"role": "user",      "content": "Hi."},
        {"role": "assistant", "content": "Hello!"},
        {"role": "user",      "content": "Who are you?"},
    ]
    formatted = solution.format_qwen_chat(msgs)
    parsed = solution.parse_qwen_chat(formatted)
    assert parsed == msgs


def test_parse_ignores_trailing_generation_prompt(solution):
    """A trailing <|im_start|>assistant\\n with no <|im_end|> is the
    generation prompt — parser should drop it, not error."""
    msgs = [{"role": "user", "content": "Hi."}]
    formatted = solution.format_qwen_chat(msgs, add_generation_prompt=True)
    parsed = solution.parse_qwen_chat(formatted)
    assert parsed == msgs


def test_content_with_newlines(solution):
    """Content can contain newlines internally; the template's only
    structural newlines are the ones around <|im_start|>/<|im_end|>."""
    msgs = [{"role": "user", "content": "line 1\nline 2\nline 3"}]
    formatted = solution.format_qwen_chat(msgs)
    parsed = solution.parse_qwen_chat(formatted)
    assert parsed == msgs
