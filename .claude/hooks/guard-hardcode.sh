#!/usr/bin/env bash
# kanji-games guard-hardcode: block hardcoded secrets, project URLs, and
# credential-like literals in source files at Edit/Write/MultiEdit time.
# Companion to guard-secrets.sh (which runs at `git commit`). Exit 2 = block.
set -u

exec python3 "$(dirname "$0")/guard-hardcode.py"
