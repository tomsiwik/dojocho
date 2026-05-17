"""Qwen3 chat template formatting.

A chat-tuned model isn't trained on raw user text — it's trained on
text formatted with a specific *chat template*. Send slightly different
text at inference and you get garbage output. The template is part of
the contract.

For Qwen3, each message is wrapped as:

    <|im_start|>{role}\\n{content}<|im_end|>\\n

Messages are concatenated. The valid roles are `system`, `user`,
`assistant`. A `system` message, if present, must come first.

Optionally, an "assistant generation prompt" is appended at the end —
the prefix the model is supposed to continue:

    <|im_start|>assistant\\n

This kata implements `format_qwen_chat(messages, add_generation_prompt=False)`
which serializes a list of message dicts into the template string.

Example:

    >>> format_qwen_chat([
    ...     {"role": "system",    "content": "You are helpful."},
    ...     {"role": "user",      "content": "Hi."},
    ...     {"role": "assistant", "content": "Hello!"},
    ... ])
    '<|im_start|>system\\nYou are helpful.<|im_end|>\\n<|im_start|>user\\nHi.<|im_end|>\\n<|im_start|>assistant\\nHello!<|im_end|>\\n'

With `add_generation_prompt=True`, the assistant header (without
content / closing tag) is appended so the model can continue:

    '...<|im_end|>\\n<|im_start|>assistant\\n'
"""

VALID_ROLES = {"system", "user", "assistant"}


def format_qwen_chat(messages: list[dict],
                     add_generation_prompt: bool = False) -> str:
    """Serialize a chat history using the Qwen3 chat template.

    Args:
        messages: list of dicts, each with keys "role" and "content".
            Roles must be one of {"system", "user", "assistant"}.
            A "system" message, if present, must be the first message.
        add_generation_prompt: if True, append `<|im_start|>assistant\\n`
            at the end so the model can continue.

    Returns:
        The template-formatted string.

    Raises:
        ValueError: if a role is invalid, or if a system message appears
            anywhere except as the first message.
    """
    ...  # implement me


def parse_qwen_chat(text: str) -> list[dict]:
    """Inverse of format_qwen_chat (ignoring trailing generation prompt).

    Parse a template-formatted string back into a list of message dicts.
    A trailing `<|im_start|>assistant\\n` without a matching `<|im_end|>`
    is ignored (it's the generation prompt for the next turn).
    """
    ...  # implement me
