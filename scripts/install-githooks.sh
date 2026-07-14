#!/usr/bin/env bash
set -euo pipefail

# Instala los githooks desde .githooks y configura git
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d ".githooks" ]; then
  echo ".githooks directory not found. Nothing to install."
  exit 0
fi

git config core.hooksPath .githooks
chmod +x .githooks/* || true
echo "Installed git hooks (core.hooksPath set to .githooks)"
