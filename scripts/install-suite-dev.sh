#!/bin/sh
# Dev-only: copy this package tree into an app's node_modules so Next.js
# Turbopack resolves the built dist and real source files (not a broken file: link).
#
# Host must have built dist first: `bun run build` in this repo.
# Safe to skip when SUITE_DIR is missing (production images).
#
# Usage (from an app directory, Docker or local):
#   SUITE_DIR=/suite-client TARGET=/app/node_modules/@xenide-io/suite-client \
#     sh /suite-client/scripts/install-suite-dev.sh
# Or via each app's thin wrapper under scripts/install-suite-client-dev.sh.

set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
SUITE_DIR=${SUITE_DIR:-$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)}

if [ -z "${TARGET:-}" ]; then
  if [ -d /app/node_modules ]; then
    TARGET=/app/node_modules/@xenide-io/suite-client
  elif [ -d ./node_modules ]; then
    TARGET=$(pwd)/node_modules/@xenide-io/suite-client
  else
    echo "install-suite-dev: set TARGET=.../node_modules/@xenide-io/suite-client" >&2
    exit 1
  fi
fi

if [ ! -d "$SUITE_DIR" ]; then
  echo "install-suite-dev: $SUITE_DIR not found, skipping"
  exit 0
fi

if [ ! -d "$SUITE_DIR/dist" ]; then
  echo "install-suite-dev: $SUITE_DIR/dist is missing."
  echo "Run: cd \"$SUITE_DIR\" && bun run build"
  exit 1
fi

echo "install-suite-dev: copying $SUITE_DIR -> $TARGET"

rm -rf "$TARGET"
mkdir -p "$TARGET"

# tar preserves structure and is faster than cp for many small files.
tar -C "$SUITE_DIR" -cf - \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  --exclude='coverage' \
  --exclude='out' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='.turbo' \
  --exclude='*.tsbuildinfo' \
  . | tar -C "$TARGET" -xf -

echo "install-suite-dev: done"
