#!/usr/bin/env python3
"""kanji-games guard-hardcode hook.

Reads a Claude Code PreToolUse JSON payload from stdin. Blocks Edit/Write/
MultiEdit calls that introduce hardcoded secrets, Supabase project URLs,
localhost URLs, or credential-like literal assignments into source files.

Companion to .claude/hooks/guard-secrets.sh (which runs at `git commit`).
Exit 2 = block; exit 0 = allow.
"""
from __future__ import annotations

import json
import re
import sys


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    ti = payload.get("tool_input", {}) or {}
    path = ti.get("file_path") or ti.get("notebook_path") or ""
    if not path:
        return 0

    # Only scan source files. Skip docs/configs/examples/lockfiles.
    if not re.search(r"\.(ts|tsx|js|jsx|mjs|cjs)$", path):
        return 0
    if re.search(r"\.(example|sample|template)\.|/node_modules/|/\.next/", path):
        return 0

    parts: list[str] = []
    if "content" in ti:
        parts.append(ti.get("content") or "")
    if "new_string" in ti:
        parts.append(ti.get("new_string") or "")
    for edit in ti.get("edits") or []:
        parts.append(edit.get("new_string") or "")

    text = "\n".join(parts)
    if not text.strip():
        return 0

    # Drop lines explicitly allowlisted by the author.
    lines = [l for l in text.splitlines() if "hardcode-allow" not in l]

    checks = [
        (r"sk_(live|test)_[A-Za-z0-9]{20,}", "Stripe secret key"),
        (r"sb_secret_[A-Za-z0-9_-]{20,}", "Supabase service-role / secret key"),
        (r"eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
         "JWT (likely service-role token)"),
        (r"ghp_[A-Za-z0-9]{30,}", "GitHub PAT"),
        (r"AKIA[0-9A-Z]{16}", "AWS access key id"),
        (r"AIza[0-9A-Za-z_-]{30,}", "Google API key"),
        (r"-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----", "Private key block"),
        (r"""["']https?://[a-zA-Z0-9-]+\.supabase\.(co|in)""",
         "hardcoded Supabase project URL"),
        (r"""["']https?://(localhost|127\.0\.0\.1)(:[0-9]+)?""",
         "hardcoded localhost URL"),
        (r"""(API_KEY|SECRET|PASSWORD|TOKEN|CLIENT_SECRET)[A-Z_]*[ \t]*[:=][ \t]*["'][A-Za-z0-9_+/=-]{24,}["']""",
         "credential-like literal assignment"),
    ]

    violations: list[str] = []
    for pattern, desc in checks:
        for line in lines:
            if re.search(pattern, line):
                violations.append(f"  {desc}\n    {line.strip()[:200]}")
                break

    if violations:
        print(f"[guard-hardcode] BLOCKED: hardcoded values in {path}", file=sys.stderr)
        print("", file=sys.stderr)
        for v in violations:
            print(v, file=sys.stderr)
        print("", file=sys.stderr)
        print("Move to env (NEXT_PUBLIC_* for client, plain for server) and read via process.env.",
              file=sys.stderr)
        print("False positive? Add a `// hardcode-allow` comment on that line.",
              file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
