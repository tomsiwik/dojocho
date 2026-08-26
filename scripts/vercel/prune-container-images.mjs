import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DEFAULT_PROJECT = "dojofoo";
const DEFAULT_REPOSITORY = "courses_api";
const DEFAULT_RETAIN = 3;

export function imagesToPrune(images, retain = DEFAULT_RETAIN) {
  if (!Number.isInteger(retain) || retain < 1) {
    throw new Error("retain must be a positive integer");
  }

  const newestReadyIds = new Set(
    images
      .filter((image) => image.status === "ready")
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, retain)
      .map((image) => image.id)
  );

  return images.filter(
    (image) =>
      (image.status === "ready" && !newestReadyIds.has(image.id)) || image.status === "failed"
  );
}

function vercel(args) {
  return execFileSync("npx", ["--yes", "vercel@59.5.0", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

function wait(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function removeImage({ image, project, repository }) {
  const attempts = 3;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      vercel([
        "vcr",
        "image",
        "rm",
        repository,
        image.id,
        "--project",
        project,
        "--yes",
        "--json",
      ]);
      return;
    } catch (error) {
      if (String(error.stdout).includes('"reason": "not_found"')) {
        return;
      }
      if (attempt === attempts) {
        throw error;
      }
      wait(attempt * 1000);
    }
  }
}

export function pruneContainerImages({
  project = process.env.VERCEL_PROJECT ?? DEFAULT_PROJECT,
  repository = process.env.VERCEL_REPOSITORY ?? DEFAULT_REPOSITORY,
  retain = Number(process.env.VERCEL_RETAIN_IMAGES ?? DEFAULT_RETAIN),
} = {}) {
  const output = vercel(["vcr", "image", "ls", repository, "--project", project, "--json"]);
  const { images } = JSON.parse(output);
  const staleImages = imagesToPrune(images, retain);

  for (const image of staleImages) {
    removeImage({ image, project, repository });
    process.stdout.write(`Deleted ${image.id} (${image.status})\n`);
    wait(500);
  }

  const retainedReady = images.filter(
    (image) => image.status === "ready" && !staleImages.includes(image)
  ).length;
  process.stdout.write(
    `Retained ${retainedReady} ready image${retainedReady === 1 ? "" : "s"}; active builds were left untouched.\n`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  pruneContainerImages();
}
