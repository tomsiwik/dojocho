import assert from "node:assert/strict";
import test from "node:test";

import { imagesToPrune } from "./prune-container-images.mjs";

test("retains the newest ready images", () => {
  const images = [
    { id: "old", status: "ready", createdAt: "2026-08-01T00:00:00Z" },
    { id: "failed", status: "failed", createdAt: "2026-08-04T00:00:00Z" },
    { id: "new", status: "ready", createdAt: "2026-08-03T00:00:00Z" },
    { id: "middle", status: "ready", createdAt: "2026-08-02T00:00:00Z" },
  ];

  assert.deepEqual(
    imagesToPrune(images, 2).map((image) => image.id),
    ["old"]
  );
});

test("requires at least one retained image", () => {
  assert.throws(() => imagesToPrune([], 0), /positive integer/);
});
