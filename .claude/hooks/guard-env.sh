#!/usr/bin/env bash
# Block edits to secret files (.env, credentials). .env.example is allowed.
set -u

input="$(cat)"
path="$(printf '%s' "$input" | python3 -c 'import json,sys
try:
  d=json.load(sys.stdin)
  print(d.get("tool_input",{}).get("file_path",""))
except Exception:
  print("")' 2>/dev/null)"

case "$path" in
  ""|*".env.example"|*".env.sample"|*".env.template")
    exit 0 ;;
  */.claude/hooks/*|*/.claude/skills/*|*/.claude/agents/*|*/.claude/commands/*)
    # Hook/skill/agent/command files often contain words like "secret" or "credential" in
    # patterns/docs but are not themselves secret stores.
    exit 0 ;;
  *".env"|*".env."*|*"credentials.json"|*"credentials.yaml"|*"credentials.yml"|*"private.key"|*"id_rsa"|*"id_ed25519"|*".pem")
    echo "[guard-env] BLOCKED: refusing to edit secret/env file: $path" >&2
    echo "If you really need to edit it, do so manually outside Claude." >&2
    exit 2 ;;
esac

exit 0
