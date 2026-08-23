import { describe, expect, it, vi } from "vitest";
import { SessionChannel, type SessionPeer } from "./delivery";

function peer(sessionId: string): SessionPeer {
  return {
    request: new Request(`http://localhost/api/session?session=${sessionId}`),
    send: vi.fn(),
    peers: [],
  };
}

describe("session websocket channel", () => {
  it("delivers notifications to every other peer in the same session", () => {
    const sender = peer("lesson-a");
    const browser = peer("lesson-a");
    const secondTab = peer("lesson-a");
    const otherLesson = peer("lesson-b");
    sender.peers = [sender, browser, secondTab, otherLesson];

    new SessionChannel(sender).broadcast({ type: "prompt" });

    expect(sender.send).not.toHaveBeenCalled();
    expect(browser.send).toHaveBeenCalledWith('{"type":"prompt"}');
    expect(secondTab.send).toHaveBeenCalledWith('{"type":"prompt"}');
    expect(otherLesson.send).not.toHaveBeenCalled();
  });

  it("rejects an unbound connection", () => {
    const connection = peer("");
    connection.request = new Request("http://localhost/api/session");
    expect(() => new SessionChannel(connection)).toThrow("session-bound connection");
  });
});
