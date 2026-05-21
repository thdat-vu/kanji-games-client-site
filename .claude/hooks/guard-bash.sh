#!/usr/bin/env bash
# kanji-games guard-bash: block destructive cmds, enforce git flow, no Claude attribution.
# Reads PreToolUse JSON on stdin. Exit 2 = block.
set -u

input="$(cat)"
cmd="$(printf '%s' "$input" | python3 -c '
import json,sys
try:
  d=json.load(sys.stdin)
  print(d.get("tool_input",{}).get("command",""))
except Exception:
  print("")' 2>/dev/null)"

block() {
  echo "[guard-bash] BLOCKED: $1" >&2
  [ -n "${2:-}" ] && echo "Reason: $2" >&2
  exit 2
}

# ---- destructive ops ---------------------------------------------------------
# Use python for precise word-boundary matching so absolute paths like /Users/... don't false-match "rm -rf /".
nuke="$(printf '%s' "$cmd" | python3 -c '
import sys,re
c=sys.stdin.read()
pats=[
  r"\brm\s+-[rRf]+\s+/\s*$",          # rm -rf /
  r"\brm\s+-[rRf]+\s+/\s",            # rm -rf / <something>
  r"\brm\s+-[rRf]+\s+~/?\s*$",        # rm -rf ~ or ~/
  r"\brm\s+-[rRf]+\s+\$HOME",         # rm -rf $HOME
  r"\brm\s+-[rRf]+\s+\*",             # rm -rf *
  r"\brm\s+-[rRf]+\s+\.\s*$",         # rm -rf .
  r"\brm\s+-[rRf]+\s+\.\.\s*$",       # rm -rf ..
]
for p in pats:
  if re.search(p, c):
    print("HIT")
    break
' 2>/dev/null)"
if [ "$nuke" = "HIT" ]; then
  block "$cmd" "filesystem nuke (target = /, ~, \$HOME, *, ., or ..)"
fi

case "$cmd" in
  *"git reset --hard"*)                          block "$cmd" "destructive reset" ;;
  *"git checkout -- ."*|*"git restore ."*)       block "$cmd" "discards uncommitted work" ;;
  *"git clean -f"*)                              block "$cmd" "deletes untracked work" ;;
  *"git branch -D"*)                             block "$cmd" "force-deletes branch" ;;
  *"supabase db reset"*)                         block "$cmd" "wipes database" ;;
  *"DROP DATABASE"*|*"DROP TABLE"*|*"TRUNCATE"*) block "$cmd" "destructive SQL" ;;
  *"--no-verify"*)                               block "$cmd" "skipping git hooks not allowed" ;;
  *"--no-gpg-sign"*|*"-c commit.gpgsign=false"*) block "$cmd" "skipping commit signing not allowed" ;;
esac

# Force-push: block to main/master/d_dev, allow on feature branches
case "$cmd" in
  *"git push"*"--force"*|*"git push"*" -f "*|*"git push"*"--force-with-lease"*)
    case "$cmd" in
      *" main"*|*" master"*|*" d_dev"*|*":main"*|*":master"*|*":d_dev"*)
        block "$cmd" "force-push to protected branch" ;;
    esac
    ;;
esac

# ---- git flow rules ----------------------------------------------------------
is_git_cmd=0
case "$cmd" in
  git\ commit*|git\ push*|gh\ pr\ create*|*\ git\ commit*|*\ git\ push*|*\ gh\ pr\ create*) is_git_cmd=1 ;;
esac

if [ "$is_git_cmd" -eq 1 ]; then
  # Block Claude attribution anywhere in the command
  if printf '%s' "$cmd" | grep -qiE "co-authored-by:|generated with claude|🤖|noreply@anthropic"; then
    block "$cmd" "Claude attribution disallowed in commits/PRs (project rule). Strip Co-Authored-By, Generated with, 🤖 lines."
  fi
fi

case "$cmd" in
  git\ commit*|*\ git\ commit*)
    branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
    case "$branch" in
      main|master|d_dev)
        block "$cmd" "direct commit to protected branch '$branch' — create a feature branch and PR into d_dev" ;;
    esac
    # Conventional commit format check on -m message
    bad="$(printf '%s' "$cmd" | python3 - <<'PY'
import sys,re,shlex
cmd=sys.stdin.read()
# Pull out anything between -m / --message and the next quoted/heredoc end.
# We do a coarse scan: any line in the command that looks like a commit subject must match the convention.
# Try shlex first; on failure fall back to regex extraction.
candidates=[]
try:
  toks=shlex.split(cmd, posix=True)
  for i,t in enumerate(toks):
    if t in ("-m","--message") and i+1<len(toks):
      candidates.append(toks[i+1])
    elif t.startswith("--message="):
      candidates.append(t[len("--message="):])
except Exception:
  pass
if not candidates:
  for m in re.finditer(r"-m\s+[\"\']([^\"\']+)[\"\']", cmd):
    candidates.append(m.group(1))
allowed=r"^(feat|fix|chore|docs|refactor|test|style|perf|build|ci|revert)(\([a-z0-9_./-]+\))?!?: .+"
for c in candidates:
  first=c.lstrip().splitlines()[0] if c.strip() else ""
  if first.startswith("Merge "): continue
  if not re.match(allowed, first):
    print("BAD: "+first)
    sys.exit(0)
PY
)"
    if [ -n "$bad" ]; then
      block "$cmd" "commit message must follow Conventional Commits (e.g. 'feat: ...', 'fix(scope): ...'). Got: ${bad#BAD: }"
    fi
    ;;
esac

# gh pr create: enforce base d_dev
case "$cmd" in
  gh\ pr\ create*|*\ gh\ pr\ create*)
    case "$cmd" in
      *"--base d_dev"*|*"--base=d_dev"*|*"-B d_dev"*) : ;;
      *) block "$cmd" "gh pr create must target d_dev — add '--base d_dev'" ;;
    esac
    # Block Claude footer in PR body — already covered above, but reinforce common phrase
    if printf '%s' "$cmd" | grep -qiE "claude\.com/claude-code|claude code"; then
      block "$cmd" "PR body contains Claude Code footer — remove it"
    fi
    ;;
esac

# git push: warn if pushing to protected branch directly (not via PR)
case "$cmd" in
  git\ push*|*\ git\ push*)
    case "$cmd" in
      *" main"*|*" master"*|*":main"*|*":master"*)
        block "$cmd" "direct push to main/master — open a PR from a feature branch into d_dev" ;;
      *" d_dev"*|*":d_dev"*)
        # Allow pushing your *current* branch where remote tracking happens to mention d_dev only via 'origin d_dev:d_dev'.
        # The simple guard: block any explicit refspec ending in :d_dev or naming d_dev as the remote ref.
        block "$cmd" "direct push to d_dev — open a PR" ;;
    esac
    ;;
esac

exit 0
