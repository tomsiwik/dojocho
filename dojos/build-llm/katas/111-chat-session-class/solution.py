"""chat-session-class — A minimal conversation state container.

A chat with an LLM is a list of messages, each tagged with a `role`
("system", "user", or "assistant"). The session owns this list and
appends to it as the conversation unfolds.

This is the same shape used by the OpenAI / Anthropic chat APIs and by
HuggingFace chat templates — it is the lingua franca of chat-style LLMs.
Get the data structure right here and the rest of Appendix G is just
glue.
"""


class ChatSession:
    """Holds the running message list for one conversation.

    Constructor seeds a `system` message. `add_user` and `add_assistant`
    append new turns. `messages` exposes the list (in order, system
    first) for the model and the UI to read.
    """

    def __init__(self, system_prompt: str) -> None:
        ...  # implement me

    def add_user(self, msg: str) -> None:
        """Append a `{"role": "user", "content": msg}` turn."""
        ...  # implement me

    def add_assistant(self, msg: str) -> None:
        """Append a `{"role": "assistant", "content": msg}` turn."""
        ...  # implement me
