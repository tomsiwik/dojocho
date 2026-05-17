"""Reference solution for cli-chat-loop."""


def run_chat(session, input_fn, output_fn, mock_model, max_turns):
    for _ in range(max_turns):
        msg = input_fn()
        if msg == "" or msg == "exit":
            break
        session.add_user(msg)
        pieces = []
        for tok in mock_model(session.messages):
            output_fn(tok)
            pieces.append(tok)
        session.add_assistant("".join(pieces))
