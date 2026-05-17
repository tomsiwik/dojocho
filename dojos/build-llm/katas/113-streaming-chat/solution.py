"""streaming-chat — Yield tokens as they come; commit at the end.

Real chat UIs print model output token-by-token as it is generated
rather than waiting for the full response. The pattern is:

  1. Ask the model for a generator of tokens.
  2. Re-yield each token to the caller (so the UI can paint it).
  3. Accumulate the tokens locally.
  4. Once the stream is exhausted, commit the joined string back to the
     `ChatSession` as one assistant message.

Critically, the new assistant message must NOT appear in
`session.messages` until the stream is fully consumed — otherwise a
re-render mid-stream sees a half-baked message.
"""

from typing import Callable, Iterator


MockModel = Callable[[list[dict]], Iterator[str]]


def chat_stream(session, mock_model: MockModel) -> Iterator[str]:
    """Stream the model's reply, then commit it to the session.

    `session` is a `ChatSession` (or anything with `.messages` and
    `.add_assistant`). `mock_model(messages) -> Iterator[str]` returns
    a token-by-token generator given the current message list.

    Yields each token as it is produced. After exhaustion, the full
    response is appended to the session via `session.add_assistant`.
    """
    ...  # implement me
