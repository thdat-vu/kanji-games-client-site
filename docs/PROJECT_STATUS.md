# Kanjido — Project Status

> Living doc. Update at the end of each PR / task. Keep it terse.

## Vision

Web app: gamified kanji learning, JLPT-driven (N5 → N1). Vietnamese-first, international-ready. Aesthetic moat: soft watercolor Japanese street + retro Win95 modal. Solo dev, ship-focused.

## Current state — 2026-05-28

**Phase 1 scope**: N5 only (~80 kanji target, currently 103 chars + 774 vocab + 821 kanji-word links seeded). Logged-in addiction loop is live.

### Stack

- Next.js 15 App Router + React 19 (RSC by default)
- TypeScript strict
- Tailwind v4 (`@theme inline`, CSS custom properties)
- Supabase (Postgres + Auth + RLS) — `@supabase/ssr`
- next-intl (vi default, en supported), Inter via next/font
- Vercel deploy
- Package manager: npm

### What's shipped

Core flow:
- `/` watercolor home with mascot, CTA "Chơi ngay"
- `/auth/login` Google OAuth (PKCE callback fixed in #40)
- `/play` lesson selector — 8 themes for N5 (numbers, time, people, body, nature, place, verbs, daily_life)
- `/play/lesson/[theme]` kanji grid with stamps for completed themes
- `/play/game?kanji=…&word=…` answer round with 30s timer

Auth:
- Sign in with Google → session cookies set on callback
- `UserMenu` dropdown with avatar (Google `avatar_url`, fallback to initial), email, sign out

Addiction loop (logged-in only):
- 3 tables (`user_streaks`, `user_word_progress`, `lesson_completions`) with RLS
- `markWordCorrect(theme, word, tz)` server action: idempotent word progress, stamps lesson when ≥5 distinct correct words, runs streak transition
- Streak rule: ≥1 lesson/day, freeze auto-grants every Monday, consumed when user misses exactly 1 day, reset on 3+ day gap
- Per-user IANA timezone for the day boundary
- UI: 🔥 badge in `/play` header, ✓ stamps on completed themes, progress bar + lessonComplete banner + streak/freeze toast in `GameRound`, comeback nudge strip on home

Answer validation:
- `isAnswerCorrect` splits both user input and meaning on `,;`
- Strips outer punctuation, lowercases, collapses whitespace
- Treats parens in meaning as optional (`ba (cái)`, `ba cái`, `ba` all accepted)
- Vietnamese diacritics preserved (`tho phao` ≠ `thở phào`)

i18n:
- All strings in `messages/vi.json` + `messages/en.json`
- ICU plurals for `kanjiCount`, `streak.label`
- Locale-prefixed routes via next-intl middleware

### Data (Supabase)

| Table | Rows | Purpose |
|---|---|---|
| `kanji` | 103 | N5 chars + theme + meaning_vi/en + Hán-Việt + readings |
| `words` | 774 | Vocab entries from JMdict + first-pass VI meanings |
| `kanji_words` | 821 | Many-to-many join |
| `user_streaks` | per user | current/longest, last_active_local_date, freeze_available, user_timezone |
| `user_word_progress` | per (user, theme, word) | distinct correct answers per theme |
| `lesson_completions` | per (user, theme) | stamp + completion_count |
| `attempts` | (legacy, unused yet) | per-attempt log |
| `profiles` | per user | display_name + locale (unused yet) |

RLS on all tables. User-data tables policy `auth.uid() = user_id`.

## Recent shipped PRs

- **#44** fix(play): treat parens in meaning as optional clarification — 2026-05-28
- **#43** fix(play): accept partial answers when meaning has multiple parts — 2026-05-28
- **#42** fix(auth): plain `<img>` + referrerPolicy=no-referrer for Google avatar — 2026-05-28
- **#41** feat(auth): UserMenu with sign out — 2026-05-28
- **#40** fix(auth): exchange OAuth code for session in callback — 2026-05-28 (critical bug)
- **#39** feat(streak): home streak strip with come-back nudge — 2026-05-28
- **#38** feat(streak): wire streak badge, lesson stamps, word progress UI — 2026-05-28
- **#37** feat(streak): server actions for streak + lesson progress — 2026-05-28
- **#36** feat(db): streak + lesson_completions schema for addiction loop — 2026-05-28
- **#35** feat(play): lesson route boundaries + home header desktop lockup — 2026-05-28

## Plan — next up

Order by leverage, not effort.

1. **Manual smoke test (no PR)** — replay 一安心 / 三つ / a multi-part word, confirm streak end-to-end with a real account, sanity-check Supabase rows.
2. **Rebrand `kanji-games` → `Kanjido`** — repo name, package.json, README. Mechanical refactor, no behavior change. Memory-noted as deferred.
3. **Stars 1–3 ⭐ per round** — accuracy + speed grade per word, store best per user/word. Replay loop deepens. Needs `attempts` table or new `user_word_stars` table.
4. **Settings page** — change locale, change timezone (currently auto-detected only), see streak/longest streak. Small surface.
5. **Polish: confetti on lesson unlock + sound on correct** — adds game feel. Adds 1 dep (`canvas-confetti`).
6. **N4 dataset** — extend from 103 → ~500 kanji. Big content lift, blocks until N5 product feel is right.

### Backlog (out of immediate scope)

- Push notifications "🔥 đừng để mất streak"
- Streak freeze as paid item (premium hook)
- Leaderboard
- Custom artist commission for mascot/illustrations (currently AI-generated for MVP)
- Mina/Dekiru curriculum mapping preset
- Stroke-order animation
- Audio TTS

## Known issues / observations

- N5 dataset is char-set-driven, not curriculum-driven. Some words feel obscure for absolute beginners (e.g. 一安心). Might need a `frequency_rank` filter on the lesson view later.
- `attempts` table exists from earlier scaffolding but is not written. Either wire it for stars (#3) or drop it.
- `profiles.display_name` and `profiles.locale` are unused. Could power #4 settings.

## Workflow

- Base branch: `d_dev`. PRs target `d_dev`, never `main`.
- Branch naming: `datvt/<type>_<topic>` (`feat`, `fix`, `chore`, `docs`).
- Conventional Commits subject lines, ≤72 chars.
- No Claude attribution in commits/PRs (enforced by `guard-bash`).
- Squash-merge each PR, delete branch, sync `d_dev` before next task.

## Updating this doc

- After merging a PR or finishing a non-PR task, append a one-line entry to **Recent shipped PRs** with the PR number, date, and one-line summary.
- If the change adds a feature or new schema, also touch the relevant section under **What's shipped** or **Data**.
- If it changes scope or unblocks a plan item, update **Plan — next up**.
- Keep the doc tight. Don't paste PR descriptions here — they live on GitHub.
