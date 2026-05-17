"""Reference solution for streaming-chat."""


def chat_stream(session, mock_model):
    pieces = []
    for tok in mock_model(session.messages):
        pieces.append(tok)
        yield tok
    session.add_assistant("".join(pieces))
