#!/usr/bin/env bash
# kanji-games guard-secrets: scan staged diff for secrets before git commit.
# Runs as PreToolUse on Bash matching `git commit`. Exit 2 = block.
set -u

input="$(cat)"
cmd="$(printf '%s' "$input" | python3 -c '
import json,sys
try:
  d=json.load(sys.stdin)
  print(d.get("tool_input",{}).get("command",""))
except Exception:
  print("")' 2>/dev/null)"

case "$cmd" in
  git\ commit*|*\ git\ commit*) : ;;
  *) exit 0 ;;
esac

block() {
  echo "[guard-secrets] BLOCKED: $1" >&2
  exit 2
}

# 1. Refuse if any .env-like file is staged (.env.example/sample/template are fine)
staged="$(git diff --cached --name-only 2>/dev/null || true)"
if [ -n "$staged" ]; then
  while IFS= read -r f; do
    case "$f" in
      *.env.example|*.env.sample|*.env.template) continue ;;
      *.env|*.env.*|*credentials.json|*credentials.yaml|*credentials.yml|*.pem|*private.key|*id_rsa|*id_ed25519)
        block "staged secret-like file: $f — unstage with 'git restore --staged $f'"
        ;;
    esac
  done <<< "$staged"
fi

# 2. Scan added lines for secret patterns
diff="$(git diff --cached --no-color 2>/dev/null || true)"
[ -z "$diff" ] && exit 0
added="$(printf '%s\n' "$diff" | grep -E '^\+[^+]' || true)"
[ -z "$added" ] && exit 0

patterns=(
  'sk_(live|test)_[A-Za-z0-9]{20,}|Stripe secret key'
  'rk_(live|test)_[A-Za-z0-9]{20,}|Stripe restricted key'
  'sb_secret_[A-Za-z0-9_-]{20,}|Supabase service-role/secret key'
  'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|JWT (likely service-role token)'
  'xox[baprs]-[A-Za-z0-9-]{10,}|Slack token'
  'ghp_[A-Za-z0-9]{30,}|GitHub PAT'
  'github_pat_[A-Za-z0-9_]{20,}|GitHub fine-grained PAT'
  'AKIA[0-9A-Z]{16}|AWS access key id'
  'AIza[0-9A-Za-z_-]{30,}|Google API key'
  '-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|Private key block'
  'PAYOS_(API_KEY|CHECKSUM_KEY|CLIENT_ID)["'\'' ]*[:=]["'\'' ]*[A-Za-z0-9_-]{16,}|PayOS credential'
  '(API_KEY|SECRET|PASSWORD|TOKEN|CLIENT_SECRET)[A-Z_]*["'\'' ]*[:=]["'\'' ]*[A-Za-z0-9_+/=-]{24,}|generic high-entropy secret assignment'
)

violations=""
for entry in "${patterns[@]}"; do
  re="${entry%%|*}"
  desc="${entry#*|}"
  hit="$(printf '%s\n' "$added" | grep -E "$re" | head -3 || true)"
  if [ -n "$hit" ]; then
    violations="${violations}--- $desc ---
$hit
"
  fi
done

if [ -n "$violations" ]; then
  echo "[guard-secrets] BLOCKED: secret-like content in staged diff" >&2
  echo "" >&2
  printf '%s' "$violations" >&2
  echo "" >&2
  echo "Move to .env (gitignored), load via process.env. False positive? Unstage, refactor, retry." >&2
  exit 2
fi

exit 0
