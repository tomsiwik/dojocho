#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Usage: scaffold.sh [kata-name]
# Copies template stub from ryu to workspace. Idempotent — skips if destination exists.

KATA_NAME="${1:-}"
DOJORC="$ROOT/.dojorc"

if [ ! -f "$DOJORC" ]; then
  echo "error: .dojorc not found — run setup first" >&2
  exit 1
fi

ACTIVE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DOJORC','utf8')).active)")
KATAS_PATH=$(node -e "
  const rc = JSON.parse(require('fs').readFileSync('$DOJORC','utf8'));
  console.log(rc.katasPath || './katas');
")
RYU_DIR=".dojo/ryu/$ACTIVE"
KATAS_JSON="$RYU_DIR/katas.json"

if [ ! -f "$KATAS_JSON" ]; then
  echo "error: $KATAS_JSON not found" >&2
  exit 1
fi

# If no kata name given, find the first not-started kata
if [ -z "$KATA_NAME" ]; then
  KATA_NAME=$(node -e "
    const katas = JSON.parse(require('fs').readFileSync('$KATAS_JSON','utf8')).katas;
    const path = require('path');
    const fs = require('fs');
    const katasPath = '$KATAS_PATH';
    for (const k of katas) {
      const dir = path.basename(path.dirname(k.template));
      const dest = path.join(katasPath, dir, 'solution.ts');
      if (!fs.existsSync(dest)) { console.log(dir); process.exit(0); }
    }
    console.error('all katas already scaffolded');
    process.exit(1);
  ")
fi

# Find template path for this kata
TEMPLATE=$(node -e "
  const katas = JSON.parse(require('fs').readFileSync('$KATAS_JSON','utf8')).katas;
  const path = require('path');
  for (const k of katas) {
    const dir = path.basename(path.dirname(k.template));
    if (dir === '$KATA_NAME') { console.log(k.template); process.exit(0); }
  }
  console.error('kata not found: $KATA_NAME');
  process.exit(1);
")

SRC="$RYU_DIR/$TEMPLATE"
DEST="$KATAS_PATH/$KATA_NAME/solution.ts"

if [ -f "$DEST" ]; then
  echo "exists: $DEST"
  exit 0
fi

if [ ! -f "$SRC" ]; then
  echo "error: template not found at $SRC" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"

# Update current in .dojorc
node -e "
  const fs = require('fs');
  const rc = JSON.parse(fs.readFileSync('$DOJORC', 'utf8'));
  rc.current = '$KATA_NAME';
  fs.writeFileSync('$DOJORC', JSON.stringify(rc, null, 2) + '\n');
"

echo "scaffolded: $DEST"
