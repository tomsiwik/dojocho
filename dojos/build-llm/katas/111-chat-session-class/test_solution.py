"""Tests for chat-session-class."""


def test_system_message_first(solution):
    s = solution.ChatSession("You are a helpful assistant.")
    assert s.messages[0] == {
        "role": "system",
        "content": "You are a helpful assistant.",
    }


def test_add_user_appends(solution):
    s = solution.ChatSession("sys")
    s.add_user("hello")
    assert s.messages[-1] == {"role": "user", "content": "hello"}
    assert len(s.messages) == 2


def test_add_assistant_appends(solution):
    s = solution.ChatSession("sys")
    s.add_user("hi")
    s.add_assistant("hello back")
    assert s.messages[-1] == {"role": "assistant", "content": "hello back"}
    assert len(s.messages) == 3


def test_order_preserved(solution):
    s = solution.ChatSession("sys")
    s.add_user("q1")
    s.add_assistant("a1")
    s.add_user("q2")
    s.add_assistant("a2")
    roles = [m["role"] for m in s.messages]
    assert roles == ["system", "user", "assistant", "user", "assistant"]
    contents = [m["content"] for m in s.messages]
    assert contents == ["sys", "q1", "a1", "q2", "a2"]


def test_system_always_first_after_many_turns(solution):
    s = solution.ChatSession("ROOT")
    for i in range(10):
        s.add_user(f"u{i}")
        s.add_assistant(f"a{i}")
    assert s.messages[0]["role"] == "system"
    assert s.messages[0]["content"] == "ROOT"


def test_messages_are_dicts_with_role_and_content(solution):
    s = solution.ChatSession("sys")
    s.add_user("hi")
    for m in s.messages:
        assert isinstance(m, dict)
        assert set(m.keys()) == {"role", "content"}
        assert isinstance(m["role"], str)
        assert isinstance(m["content"], str)


def test_independent_sessions(solution):
    """Two sessions must not share state — common foot-gun is a class-level list."""
    a = solution.ChatSession("A")
    b = solution.ChatSession("B")
    a.add_user("hello from A")
    assert len(b.messages) == 1
    assert b.messages[0]["content"] == "B"
