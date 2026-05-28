# Kanji Games — Project Guide for Claude

Web app: gamified kanji learning. **Solo developer, ship-focused.** Target users: Vietnamese + international Japanese learners (non-tech).

## Stack

- **Next.js 15** App Router + **React 19** (RSC by default; use `'use client'` only when needed)
- **TypeScript** strict
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Supabase** (Postgres + Auth + RLS) — `@supabase/ssr` for server-side; `@supabase/supabase-js` for client
- **Vercel** deploy
- **i18n**: `next-intl` (planned `vi` + `en`; `vi` default)
- Package manager: **npm**

## Product principles

1. **JLPT-driven, not textbook-driven.** Content organized by N5→N1 levels. Do *not* port Mina/Dekiru lesson order — copyright + scope creep. A "Mina mapping" preset is phase 2.
2. **One kanji deep-dive.** Core flow: pick kanji → see all compounds across N5..N1 → play game on chosen word. This is the moat.
3. **Aesthetic is the moat.** Soft watercolor Japanese street + retro Win95 modal. **Never publicly call this "Ghibli style"** — copy says *"soft watercolor Japanese aesthetic"* / *"warm illustrated Japan"*. AI-generated art for MVP; commission artist before public launch.
4. **Vietnamese-first, international-ready.** All UI text must have VI + EN keys from day one. Hán-Việt readings are a competitive moat for VN users — keep them in the data model.
5. **Phase 1 scope = N5 only.** ~80 kanji, ~600 vocab. Do NOT build N1 vocab, stroke-order animation, audio TTS, leaderboard, or social features yet.

## Data sources (open, attribution required)

- **KANJIDIC2** + **JMdict** ([EDRDG license](http://www.edrdg.org/edrdg/license.html), CC-BY-SA) — onyomi, kunyomi, vocab, readings. **Footer attribution required.**
- **davidluzgouveia/kanji-data** (MIT) — JLPT level mappings
- **AnchorI/jlpt-kanji-dictionary** — cross-reference
- Vietnamese meanings + Hán-Việt: build/curate ourselves (this is the moat)

## Coding rules (project-specific)

- **Use Edit tool**, never `sed`/`awk` for code edits.
- **Server Components first.** Add `'use client'` only when needed (event handlers, hooks, browser APIs).
- **Supabase clients**: use [src/lib/supabase/server.ts](src/lib/supabase/server.ts) in RSC/Route Handlers, [src/lib/supabase/client.ts](src/lib/supabase/client.ts) in Client Components. Never import `server.ts` from a client component.
- **RLS on every table.** Never query a table without policies; never bypass with the service role key from the client.
- **i18n discipline**: when adding any user-facing string, add the key to both `messages/vi.json` and `messages/en.json` in the same edit. Don't ship VI-only.
- **Don't introduce abstractions** (factories, generic game engines) until there are 3 concrete cases. Two is a coincidence.
- **Don't add tests** for component visuals. Test the kanji/word selection logic, answer-validation, progress writes — the things that break silently.
- **No comments unless WHY is non-obvious.** Names should explain WHAT.
- **Secrets**: never read or echo `.env*` files. The `guard-env` hook will block edits anyway.

## Git workflow (enforced by hooks)

- **Default base branch**: `d_dev`. PRs must target `d_dev` (not `main`).
- **Never commit directly** to `main`, `master`, or `d_dev`. Always create a feature branch.
- **Branch naming**: `<author>/<scope>_<topic>` e.g., `datvt/feat_seed-n5-kanji`. Match the existing `datvt/...` style on the repo.
- **Commit message**: Conventional Commits.
  - Format: `<type>(<scope>)?: <subject>` — types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `build`, `ci`, `revert`.
  - Subject in imperative present tense, no trailing period, < 72 chars.
  - Optional body wrapped at ~72 cols, separated by blank line.
- **No Claude attribution anywhere.** Never include `Co-Authored-By: Claude`, `🤖 Generated with Claude Code`, `noreply@anthropic.com`, or links to claude.com — not in commit messages, commit bodies, or PR descriptions. The `guard-bash` hook blocks commits/PRs containing these.
- **No `--no-verify`, no `--no-gpg-sign`.** Hooks must run; signing must not be skipped.
- **Force-push** is blocked on `main`/`master`/`d_dev`. Allowed on feature branches when needed (rebase cleanup).
- **Secrets**: `guard-secrets` hook scans the staged diff at `git commit` time. It blocks staged `.env`/credential files and high-entropy patterns (Stripe `sk_*`, Supabase `sb_secret_*`, JWTs, GitHub PATs, AWS keys, PEM private keys, `*_API_KEY = "..."` patterns).

## PR workflow

- `gh pr create` must include `--base d_dev`. The hook blocks otherwise.
- PR title: same Conventional Commits format as commit subject (under ~70 chars).
- PR body sections (no Claude footer):
  ```
  ## Summary
  - <bullet>
  - <bullet>

  ## Test plan
  - [ ] <todo>
  ```
- Don't push to remote unless the user explicitly asks. When asked, push to a feature branch with `-u origin <branch>`.

## What "done" looks like for a feature

1. Code written + types passing (`npx tsc --noEmit`)
2. `npm run lint` clean
3. `npm run build` succeeds
4. Manually played the flow in the browser
5. VI + EN strings both present
6. RLS verified if DB schema changed (`mcp__plugin_supabase_supabase__get_advisors security`)
7. Committed on a feature branch with a Conventional Commits message
8. PR opened against `d_dev` (no Claude attribution in title/body)



- `seed-kanji` — import open kanji datasets into Supabase
- `add-game-mode` — scaffold a new mini-game (route + component + types)
- `i18n-key` — add a translation key in VI + EN simultaneously

## ECC skills to invoke (v2.0.0-rc.1)

Stack-relevant ECC skills. Invoke explicitly via the Skill tool when the topic matches; do not auto-invoke for unrelated work.

- **`ecc:nextjs-turbopack`** — Next 16+/Turbopack, dev speed, when Turbopack vs webpack.
- **`ecc:postgres-patterns`** — Supabase/Postgres query, schema, indexing.
- **`ecc:database-migrations`** — schema/data migrations, zero-downtime.
- **`ecc:frontend-patterns`** + **`ecc:frontend-a11y`** + **`ecc:accessibility`** — RSC patterns + WCAG 2.2 AA.
- **`ecc:coding-standards`** — baseline naming/readability.
- **`ecc:git-workflow`** — branching/commit conventions (already enforced by `guard-bash`).
- **`ecc:safety-guard`** — destructive-op gate when touching Supabase prod.
- **`ecc:design-system`** — visual consistency audit for the watercolor aesthetic.
- **`ecc:code-tour`** — `.tour` walkthroughs (use post-MVP for onboarding).

ECC also wires PreToolUse hooks (`gateguard-fact-force`, `governance-capture`, `mcp-health-check`, `suggest-compact`, etc.). They coexist with the project's `guard-bash` / `guard-env` / `guard-secrets`. If `gateguard-fact-force` slows a known multi-file edit pass, set `ECC_GATEGUARD_DISABLED=1` for that session.

## Pointers

- Project status (living doc): [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) — update after every merged PR
- Product vision: [README.md](README.md)
- Current game flow: [src/components/features/play/](src/components/features/play/)
- Demo data (placeholder): [src/lib/data/kanji-demo.ts](src/lib/data/kanji-demo.ts) — to be replaced by Supabase queries
- Supabase project ID: stored in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`)
