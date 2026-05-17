"""cli-chat-loop — Put the pieces together.

A complete chat REPL in one function:

    repeat up to max_turns:
        msg = input_fn()        # user types something
        if msg in {"", "exit"}: break
        session.add_user(msg)
        for tok in stream:      # mock_model streams tokens
            output_fn(tok)      # paint to screen
        commit assistant reply to session

This is the integration kata for Appendix G. The previous three katas
gave you the parts (session, truncation, streaming); here you wire
them into something that behaves like the inner loop of Chainlit (or
a terminal chatbot) — without any I/O dependency, because `input_fn`
and `output_fn` are injected and `mock_model` is fake.
"""

from typing import Callable, Iterator


InputFn = Callable[[], str]
OutputFn = Callable[[str], None]
MockModel = Callable[[list[dict]], Iterator[str]]


def run_chat(
    session,
    input_fn: InputFn,
    output_fn: OutputFn,
    mock_model: MockModel,
    max_turns: int,
) -> None:
    """Run the chat loop for up to `max_turns` user turns.

    Each turn:
      1. Read a user message via `input_fn()`.
      2. If the message is empty or equals "exit", stop.
      3. Append the user message to `session`.
      4. Call `mock_model(session.messages)` for a token generator.
      5. For each token, call `output_fn(token)` and accumulate it.
      6. Commit the joined response to `session.add_assistant(...)`.
    """
    ...  # implement me
