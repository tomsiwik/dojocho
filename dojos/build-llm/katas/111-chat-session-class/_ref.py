"""Reference solution for chat-session-class."""


class ChatSession:
    def __init__(self, system_prompt: str) -> None:
        self.messages: list[dict] = [
            {"role": "system", "content": system_prompt}
        ]

    def add_user(self, msg: str) -> None:
        self.messages.append({"role": "user", "content": msg})

    def add_assistant(self, msg: str) -> None:
        self.messages.append({"role": "assistant", "content": msg})
