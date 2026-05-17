"""Reference implementation — extract-boxed-answer."""


def extract_boxed(text: str) -> str | None:
    if not text:
        return None
    idx = text.rfind(r"\boxed")
    if idx == -1:
        return None
    i = idx + len(r"\boxed")
    while i < len(text) and text[i].isspace():
        i += 1
    if i >= len(text) or text[i] != "{":
        return None
    i += 1
    depth = 1
    start = i
    while i < len(text) and depth > 0:
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        i += 1
    if depth != 0:
        return None
    return text[start:i - 1]
