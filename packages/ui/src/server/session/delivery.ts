export type SessionPeer = {
  request: Request;
  send(data: string): unknown;
  peers: Iterable<SessionPeer>;
};

export class SessionChannel {
  readonly id: string;

  constructor(private readonly peer: SessionPeer) {
    const id = sessionId(peer);
    if (!id) throw new Error("A session-bound connection is required");
    this.id = id;
  }

  send(value: unknown): void {
    this.peer.send(JSON.stringify(value));
  }

  broadcast(value: unknown): void {
    const data = JSON.stringify(value);
    for (const peer of this.peer.peers) {
      if (peer === this.peer || sessionId(peer) !== this.id) continue;
      peer.send(data);
    }
  }

  emit(value: unknown): void {
    this.send(value);
    this.broadcast(value);
  }
}

function sessionId(peer: Pick<SessionPeer, "request">): string | null {
  return new URL(peer.request.url).searchParams.get("session");
}
