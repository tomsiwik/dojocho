#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import process from "node:process";
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom";

const INKAF_REVISION = "cd5cf29d5df22e07b1e9209219079ca44015b7fe";
const INKAF = `inkaf @ git+https://gitlab.com/inkscape/extras/extension-afdesign.git@${INKAF_REVISION}`;
const NUMBER_SOURCE = String.raw`[-+]?(?:\d*\.\d+|\d+\.?)(?:[Ee][-+]?\d+)?`;
const TOKEN = new RegExp(`[A-Za-z]|${NUMBER_SOURCE}`, "g");
const NUMBER = new RegExp(NUMBER_SOURCE, "g");
const MATRIX = /^matrix\(([^)]+)\)$/;
const ARITY = new Map([["M", 2], ["L", 2], ["C", 6], ["S", 4], ["Q", 4], ["T", 2], ["Z", 0]]);
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function usage() {
  console.log(`Usage: node scripts/assets/apply-svg-perspective.mjs [--margin number] [--fills-only] <flat.svg> <perspective.af> <output.svg> [output.svg ...]

Extract the first Affinity Pers live filter and bake it into editable SVG paths.`);
}

function parseArguments(argv) {
  let margin = 8;
  let fillsOnly = false;
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--help" || argv[index] === "-h") {
      usage();
      process.exit(0);
    }
    if (argv[index] === "--margin") {
      margin = Number(argv[++index]);
      if (!Number.isFinite(margin)) throw new Error("--margin must be a number");
    } else if (argv[index] === "--fills-only") {
      fillsOnly = true;
    } else {
      positional.push(argv[index]);
    }
  }
  if (positional.length < 3) {
    usage();
    throw new Error("Expected a flat SVG, an Affinity file, and at least one output SVG");
  }
  return { source: positional[0], affinity: positional[1], outputs: positional.slice(2), margin, fillsOnly };
}

const identity = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

function multiply(left, right) {
  return left.map((_, row) => right[0].map((__, column) =>
    [0, 1, 2].reduce((sum, index) => sum + left[row][index] * right[index][column], 0)));
}

function affine(raw) {
  if (!raw) return identity();
  const match = raw.trim().match(MATRIX);
  if (!match) throw new Error(`Unsupported SVG transform ${JSON.stringify(raw)}; export using matrix transforms`);
  const [a, b, c, d, e, f] = match[1].trim().split(/[ ,]+/).map(Number);
  if ([a, b, c, d, e, f].some((value) => !Number.isFinite(value))) throw new Error(`Invalid SVG transform ${raw}`);
  return [[a, c, e], [b, d, f], [0, 0, 1]];
}

function solve(matrix, values) {
  const augmented = matrix.map((row, index) => [...row, values[index]]);
  for (let column = 0; column < values.length; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < values.length; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    if (Math.abs(augmented[pivot][column]) < 1e-12) throw new Error("Perspective quadrilateral is degenerate");
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    augmented[column] = augmented[column].map((value) => value / divisor);
    for (let row = 0; row < values.length; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      augmented[row] = augmented[row].map((value, index) => value - factor * augmented[column][index]);
    }
  }
  return augmented.map((row) => row.at(-1));
}

function homography(source, destination) {
  const rows = [];
  const values = [];
  source.forEach(([x, y], index) => {
    const [u, v] = destination[index];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    values.push(u, v);
  });
  const h = solve(rows, values);
  return [h.slice(0, 3), h.slice(3, 6), [h[6], h[7], 1]];
}

function project([x, y], inner, warp, outer) {
  const input = [x, y, 1];
  const source = inner.map((row) => row.reduce((sum, value, index) => sum + value * input[index], 0));
  const warped = warp.map((row) => row.reduce((sum, value, index) => sum + value * source[index], 0));
  if (Math.abs(warped[2]) < 1e-12) throw new Error("A transformed SVG point lies at infinity");
  const normalized = [warped[0] / warped[2], warped[1] / warped[2], 1];
  return outer.slice(0, 2).map((row) => row.reduce((sum, value, index) => sum + value * normalized[index], 0));
}

function extractAffinityDocument(path) {
  const helper = [
    "from io import BytesIO",
    "import json, sys",
    "from inkaf.parser.extract import AFExtractor",
    "from inkaf.parser.parse import AFParser",
    "from inkaf.parser.json_encoder import EnhancedJSONEncoder",
    "with open(sys.argv[1], 'rb') as stream:",
    " e = AFExtractor(stream)",
    " data = e.extract(e.get_head_revision('doc.dat'))",
    " json.dump(AFParser(BytesIO(data)).parse(), sys.stdout, cls=EnhancedJSONEncoder)",
  ].join("\n");
  const result = spawnSync("uv", ["run", "--with", INKAF, "python", "-c", helper, path], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw new Error(`Could not run uv: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Affinity extraction failed:\n${result.stderr.trim()}`);
  return JSON.parse(result.stdout);
}

function findPerspective(value) {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findPerspective(child);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    const tags = new Set((value.types ?? []).map((entry) => entry?.tag));
    if (tags.has("Pers") && value["Src "] && value["Dst "]) return value;
    for (const child of Object.values(value)) {
      const found = findPerspective(child);
      if (found) return found;
    }
  }
  return undefined;
}

function quad(field) {
  const value = field.value;
  const stored = [0, 1, 2, 3].map((index) => [value[`X${index}  `].value, value[`Y${index}  `].value]);
  // Affinity serializes TL, BL, BR, TR; homography expects TL, TR, BR, BL.
  return [stored[0], stored[3], stored[2], stored[1]];
}

function perspective(path) {
  const found = findPerspective(extractAffinityDocument(path));
  if (!found) throw new Error(`No Affinity Pers live filter found in ${path}`);
  return [quad(found["Src "]), quad(found["Dst "])];
}

function circlePath(element) {
  const cx = Number(element.getAttribute("cx"));
  const cy = Number(element.getAttribute("cy"));
  const radius = Number(element.getAttribute("r"));
  const control = 0.5522847498307936 * radius;
  return `M ${cx + radius},${cy} C ${cx + radius},${cy + control} ${cx + control},${cy + radius} ${cx},${cy + radius} C ${cx - control},${cy + radius} ${cx - radius},${cy + control} ${cx - radius},${cy} C ${cx - radius},${cy - control} ${cx - control},${cy - radius} ${cx},${cy - radius} C ${cx + control},${cy - radius} ${cx + radius},${cy - control} ${cx + radius},${cy} Z`;
}

function warpPath(data, inner, warp, outer) {
  const tokens = data.match(TOKEN) ?? [];
  const output = [];
  let index = 0;
  let command;
  while (index < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[index])) {
      command = tokens[index++];
      if (command.toUpperCase() === "Z") {
        output.push("Z");
        continue;
      }
    }
    if (!command || command !== command.toUpperCase() || !ARITY.has(command)) {
      throw new Error(`Unsupported path command ${JSON.stringify(command)}; use absolute M/L/C/S/Q/T/Z paths and convert arcs first`);
    }
    const count = ARITY.get(command);
    const coordinates = tokens.slice(index, index + count).map(Number);
    if (coordinates.length !== count) throw new Error(`Incomplete SVG ${command} command`);
    index += count;
    const points = [];
    for (let offset = 0; offset < count; offset += 2) {
      points.push(project([coordinates[offset], coordinates[offset + 1]], inner, warp, outer));
    }
    output.push(command + points.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" "));
    if (command === "M") command = "L";
  }
  return output.join(" ");
}

function childElements(element) {
  return Array.from(element.childNodes).filter((child) => child.nodeType === 1);
}

function generate(sourcePath, outputPath, sourceQuad, destinationQuad, margin, fillsOnly) {
  const sourceDocument = new DOMParser().parseFromString(readFileSync(sourcePath, "utf8"), "image/svg+xml");
  const sourceRoot = sourceDocument.documentElement;
  const artboard = childElements(sourceRoot).find((child) => child.localName === "g");
  if (!artboard) throw new Error("Expected the Affinity SVG export to contain a top-level artboard group");
  const outer = affine(artboard.getAttribute("transform"));
  const warp = homography(sourceQuad, destinationQuad);
  const paths = [];

  function visit(element, transform) {
    const combined = multiply(transform, affine(element.getAttribute("transform")));
    if (element.localName === "path" || element.localName === "circle") {
      if (fillsOnly && !element.getAttribute("style")?.includes("fill:white")) return;
      const attributes = {};
      for (const attribute of Array.from(element.attributes)) {
        if (!["d", "cx", "cy", "r", "transform"].includes(attribute.name)) attributes[attribute.name] = attribute.value;
      }
      const data = element.localName === "path" ? element.getAttribute("d") : circlePath(element);
      attributes.d = warpPath(data, combined, warp, outer);
      paths.push(attributes);
    }
    childElements(element).forEach((child) => visit(child, combined));
  }

  childElements(artboard).filter((child) => child.localName !== "rect").forEach((child) => visit(child, identity()));
  if (paths.length === 0) throw new Error("No paths or circles found in the source SVG");
  const points = paths.flatMap(({ d }) => {
    const numbers = (d.match(NUMBER) ?? []).map(Number);
    return Array.from({ length: numbers.length / 2 }, (_, index) => [numbers[index * 2], numbers[index * 2 + 1]]);
  });
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);

  const outputDocument = new DOMImplementation().createDocument(SVG_NAMESPACE, "svg", null);
  const outputRoot = outputDocument.documentElement;
  outputRoot.setAttribute("viewBox", `${(minX - margin).toFixed(3)} ${(minY - margin).toFixed(3)} ${(maxX - minX + 2 * margin).toFixed(3)} ${(maxY - minY + 2 * margin).toFixed(3)}`);
  const style = sourceRoot.getAttribute("style");
  if (style) outputRoot.setAttribute("style", style);
  const group = outputDocument.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("id", "perspective-artwork");
  outputRoot.appendChild(group);
  for (const attributes of paths) {
    const path = outputDocument.createElementNS(SVG_NAMESPACE, "path");
    Object.entries(attributes).forEach(([name, value]) => path.setAttribute(name, value));
    group.appendChild(path);
  }
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `<?xml version="1.0" encoding="utf-8"?>\n${new XMLSerializer().serializeToString(outputDocument)}\n`);
  return warp;
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  const [sourceQuad, destinationQuad] = perspective(args.affinity);
  const [primary, ...copies] = args.outputs;
  const warp = generate(args.source, primary, sourceQuad, destinationQuad, args.margin, args.fillsOnly);
  for (const destination of copies) {
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(primary, destination);
  }
  console.log(`Generated ${args.outputs.join(", ")}`);
  console.log(`Source:      ${JSON.stringify(sourceQuad)}`);
  console.log(`Destination: ${JSON.stringify(destinationQuad)}`);
  console.log("Homography:");
  warp.forEach((row) => console.log(`  ${row.map((value) => value.toPrecision(12)).join(" ")}`));
}

try {
  main();
} catch (error) {
  console.error(`error: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
