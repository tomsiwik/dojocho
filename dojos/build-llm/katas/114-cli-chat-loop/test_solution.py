"""Tests for cli-chat-loop."""

import pytest


class FakeSession:
    def __init__(self, system_prompt="sys"):
        self.messages = [{"role": "system", "content": system_prompt}]

    def add_user(self, msg):
        self.messages.append({"role": "user", "content": msg})

    def add_assistant(self, msg):
        self.messages.append({"role": "assistant", "content": msg})


def make_input_fn(scripted):
    """Return an input_fn that pops from a list of pre-canned messages."""
    queue = list(scripted)

    def _input():
        if not queue:
            return "exit"
        return queue.pop(0)

    return _input


def make_output_fn():
    """Return (output_fn, sink_list) so tests can inspect what was printed."""
    sink = []

    def _out(piece):
        sink.append(piece)

    return _out, sink


def make_echo_model(prefix="echo: "):
    """Mock model that streams 'prefix' + last user message, char by char."""
    def _model(messages):
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"),
            "",
        )
        for ch in prefix + last_user:
            yield ch
    return _model


# ---------- deterministic happy path ----------


def test_single_turn(solution):
    s = FakeSession()
    in_fn = make_input_fn(["hello"])
    out_fn, sink = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model(), max_turns=5)

    assert "".join(sink) == "echo: hello"
    # system + user + assistant
    assert [m["role"] for m in s.messages] == ["system", "user", "assistant"]
    assert s.messages[1]["content"] == "hello"
    assert s.messages[2]["content"] == "echo: hello"


def test_multiple_turns(solution):
    s = FakeSession()
    in_fn = make_input_fn(["q1", "q2", "q3"])
    out_fn, sink = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model(""), max_turns=10)

    assert [m["role"] for m in s.messages] == [
        "system",
        "user", "assistant",
        "user", "assistant",
        "user", "assistant",
    ]
    assert [m["content"] for m in s.messages[1:]] == [
        "q1", "q1", "q2", "q2", "q3", "q3",
    ]


# ---------- max_turns cap ----------


def test_max_turns_caps_loop(solution):
    s = FakeSession()
    in_fn = make_input_fn(["a", "b", "c", "d", "d", "e"])
    out_fn, _ = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model(""), max_turns=2)

    # Only 2 user / 2 assistant messages.
    non_system = [m for m in s.messages if m["role"] != "system"]
    assert len(non_system) == 4
    assert [m["content"] for m in non_system] == ["a", "a", "b", "b"]


# ---------- exit conditions ----------


def test_empty_input_stops(solution):
    s = FakeSession()
    in_fn = make_input_fn(["hello", "", "should-not-run"])
    out_fn, _ = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model(""), max_turns=10)

    non_system = [m for m in s.messages if m["role"] != "system"]
    assert [m["content"] for m in non_system] == ["hello", "hello"]


def test_exit_command_stops(solution):
    s = FakeSession()
    in_fn = make_input_fn(["hello", "exit", "should-not-run"])
    out_fn, _ = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model(""), max_turns=10)

    non_system = [m for m in s.messages if m["role"] != "system"]
    assert [m["content"] for m in non_system] == ["hello", "hello"]


# ---------- output_fn is called per token, not per response ----------


def test_output_fn_called_per_token(solution):
    s = FakeSession()
    in_fn = make_input_fn(["hi"])
    out_fn, sink = make_output_fn()
    solution.run_chat(s, in_fn, out_fn, make_echo_model("AB"), max_turns=1)

    # "AB" + "hi" = 4 characters; sink should have 4 entries.
    assert sink == ["A", "B", "h", "i"]


# ---------- model sees prior turns ----------


def test_model_sees_history(solution):
    """On turn 2, the model's input should include the assistant reply
    from turn 1."""
    seen_per_call = []

    def model(messages):
        seen_per_call.append([(m["role"], m["content"]) for m in messages])
        for ch in "ok":
            yield ch

    s = FakeSession("S")
    solution.run_chat(
        s,
        make_input_fn(["first", "second"]),
        make_output_fn()[0],
        model,
        max_turns=5,
    )

    # First call: system + user "first"
    assert seen_per_call[0] == [("system", "S"), ("user", "first")]
    # Second call: system + user/assistant from turn 1 + user "second"
    assert seen_per_call[1] == [
        ("system", "S"),
        ("user", "first"),
        ("assistant", "ok"),
        ("user", "second"),
    ]
