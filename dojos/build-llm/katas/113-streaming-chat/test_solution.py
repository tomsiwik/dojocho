"""Tests for streaming-chat."""

import pytest


class FakeSession:
    """Minimal stand-in for ChatSession; tracks add_assistant calls."""

    def __init__(self, system_prompt="sys"):
        self.messages = [{"role": "system", "content": system_prompt}]

    def add_user(self, msg):
        self.messages.append({"role": "user", "content": msg})

    def add_assistant(self, msg):
        self.messages.append({"role": "assistant", "content": msg})


def make_model(tokens):
    """Return a mock model that ignores input and yields these tokens."""
    def _model(messages):
        for t in tokens:
            yield t
    return _model


# ---------- basic yielding ----------


def test_yields_exact_tokens(solution):
    s = FakeSession()
    s.add_user("hi")
    tokens = ["Hello", " ", "world", "!"]
    out = list(solution.chat_stream(s, make_model(tokens)))
    assert out == tokens


def test_yields_zero_tokens(solution):
    s = FakeSession()
    s.add_user("hi")
    out = list(solution.chat_stream(s, make_model([])))
    assert out == []


# ---------- session is updated AFTER consumption ----------


def test_assistant_message_appears_after_full_consumption(solution):
    s = FakeSession()
    s.add_user("hi")
    n_before = len(s.messages)
    list(solution.chat_stream(s, make_model(["a", "b", "c"])))
    assert len(s.messages) == n_before + 1
    assert s.messages[-1] == {"role": "assistant", "content": "abc"}


def test_assistant_message_not_present_mid_stream(solution):
    """While the generator is partially consumed, the assistant message
    must NOT yet be in session.messages — otherwise a UI re-render would
    see a half-baked response."""
    s = FakeSession()
    s.add_user("hi")
    n_before = len(s.messages)
    gen = solution.chat_stream(s, make_model(["x", "y", "z"]))
    first = next(gen)
    assert first == "x"
    # After yielding one token, the session must NOT yet have the
    # assistant message.
    assert len(s.messages) == n_before
    # Consume the rest.
    rest = list(gen)
    assert rest == ["y", "z"]
    # Now it should be there.
    assert s.messages[-1] == {"role": "assistant", "content": "xyz"}


# ---------- model sees current session ----------


def test_model_receives_current_messages(solution):
    """The mock model should be called with the session's messages."""
    seen = {}

    def model(messages):
        seen["messages"] = list(messages)
        yield "ok"

    s = FakeSession("you are helpful")
    s.add_user("ping")
    list(solution.chat_stream(s, model))
    assert seen["messages"][0]["role"] == "system"
    assert seen["messages"][-1] == {"role": "user", "content": "ping"}


# ---------- count exactness ----------


@pytest.mark.parametrize("n", [1, 5, 20, 100])
def test_yields_exactly_n_tokens(solution, n):
    s = FakeSession()
    s.add_user("hi")
    tokens = [f"t{i}" for i in range(n)]
    out = list(solution.chat_stream(s, make_model(tokens)))
    assert len(out) == n
    assert s.messages[-1]["content"] == "".join(tokens)
