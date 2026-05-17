"""Qwen3 chat template formatting (reference)."""

import re


VALID_ROLES = {"system", "user", "assistant"}


def format_qwen_chat(messages: list[dict],
                     add_generation_prompt: bool = False) -> str:
    out = []
    for i, msg in enumerate(messages):
        role = msg["role"]
        content = msg["content"]
        if role not in VALID_ROLES:
            raise ValueError(
                f"Invalid role {role!r}; must be one of {sorted(VALID_ROLES)}."
            )
        if role == "system" and i != 0:
            raise ValueError(
                f"System message must be the first message; found at index {i}."
            )
        out.append(f"<|im_start|>{role}\n{content}<|im_end|>\n")
    if add_generation_prompt:
        out.append("<|im_start|>assistant\n")
    return "".join(out)


_MSG_RE = re.compile(
    r"<\|im_start\|>(system|user|assistant)\n(.*?)<\|im_end\|>\n",
    re.DOTALL,
)


def parse_qwen_chat(text: str) -> list[dict]:
    return [
        {"role": role, "content": content}
        for role, content in _MSG_RE.findall(text)
    ]
