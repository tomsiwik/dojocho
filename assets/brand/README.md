# Dojofoo logo sources

`dojofoo-flat.svg` is the editable flat artwork. `dojofoo-perspective.af`
contains the Affinity `Pers` live filter used to distort it. Rebuild the SVG
served by the shared UI after changing either source:

```sh
pnpm assets:logo
```

The command extracts the filter's source and destination quadrilaterals and
bakes their projective transform into the SVG path coordinates. It updates the
shared local UI and marketplace assets together. The generated SVG remains
vector-only; do not edit either generated copy by hand.

The transformer is JavaScript. It uses the pinned InkAF utility through `uv`
only to decode Affinity's proprietary file container.

The logo build uses `--fills-only` to omit Affinity's separate outline paths;
the shared inline SVG component colors the remaining face paths with
`currentColor`.
