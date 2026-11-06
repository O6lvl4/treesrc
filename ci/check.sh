#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
compiler="${ALMIDE_BIN:-almide}"
"$compiler" fmt --check src/
"$compiler" test
"$compiler" build
python3 ci/smoke.py
