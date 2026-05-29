# Kanjido (漢字道)

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-C9603E)

A gamified kanji learning web app for Vietnamese and international JLPT learners. The core flow is a single-kanji deep-dive: pick one kanji, see every compound it appears in across N5 → N1, and play short answer rounds against a 30-second timer. Designed mobile-first, soft watercolor aesthetic with a Win95 modal accent, Vietnamese-first copy with full English fallback.

## ▶︎ Try it live

**Kanjido runs in your browser at `https://kanjido.vercel.app/`.** Anonymous works — no sign-in needed for the core flow. Optional Google sign-in (Supabase Auth) unlocks the streak loop, lesson stamps, and star-grading per word.

Suggested first run:

1. Open `/` and click **Chơi ngay** — lands on the lesson selector with 8 N5 themes (numbers, time, people, body, nature, place, verbs, daily life).
2. Pick **Số đếm (Numbers)** → tap **一** → the kanji's level map fans out N5 → N1 with word counts. N5 has the most data; cards labeled "Sắp có" simply have no words seeded yet.
3. Choose any N5 word (e.g. **一つ**) → mode picker appears. Pick **Nghĩa** for meaning, **Cách đọc** for the kanji reading. The 30s timer only starts after you choose.
4. Type the answer and submit. Star grading: ≥20s left = 3⭐, ≥10s = 2⭐, correct = 1⭐, wrong/timeout = 0⭐. Best per (user, word) is upgraded only.
5. Complete 5 distinct words in the same theme → the lesson is stamped ✓ on `/play` and the home streak chip shows 🔥. Miss a day, freeze auto-grants every Monday and consumes silently.

The ❓ icon in every header opens a Win95-styled tutorial modal with screen-specific copy. First-time visitors to `/play/game` see a dismissable banner; "Xem lại hướng dẫn" in the user menu resets the flag.

---

## System Architecture

Single-process Next.js 15 App Router app talking to Supabase. No separate backend service — RSC + Server Actions handle data access end-to-end. The architecture stays deliberately small so a solo dev can ship features without spending half the time on infra.

* **Frontend (Next.js 15 + React 19):** App Router, RSC by default. Client components only where event handlers, browser APIs, or local state are unavoidable (`GameRound`, `LocaleSwitcher`, `HelpModal`, `UserMenu`). Tailwind v4 with CSS custom properties for theme tokens (`--color-primary`, `--shadow-soft`, `--window-*` for the Win95 chrome).
* **Data Layer (Supabase Postgres):** Every table has RLS. User-owned tables (`user_streaks`, `user_word_progress`, `lesson_completions`) policy on `auth.uid() = user_id`; reference tables (`kanji`, `words`, `kanji_words`) are public-read.
* **Auth (Supabase Auth + Google OAuth):** PKCE flow handled in `src/app/auth/callback/route.ts`. `@supabase/ssr` for cookie-based sessions on the server, `@supabase/supabase-js` on the client. Service role key never reaches the bundle — only `NEXT_PUBLIC_*` keys are exposed.
* **i18n (next-intl 4.12):** Locale-prefixed routes (`/vi`, `/en`), ICU plurals for streaks and word counts. Every user-facing string ships in `messages/vi.json` + `messages/en.json` in the same edit — VI-only strings are blocked in review.
* **Content pipeline (offline scripts):** N5/N4 vocabulary built from JMdict + KANJIDIC2 + Unihan dumps via `scripts/seed-n5/` and `scripts/seed-n4/`. The build step picks the top-N most-frequent JMdict words containing each kanji, stamps Hán-Việt readings from Unihan, writes a TSV, and a separate seed script idempotently inserts into Supabase.

---

## Repository Structure

```
src/
  app/
    [locale]/                   # next-intl locale-prefixed routes
      page.tsx                  # / — watercolor home, mascot, CTA
      auth/login/page.tsx       # /auth/login — Google OAuth entry
      play/                     # logged-in addiction loop
        page.tsx                # /play — lesson selector + streak chip
        layout.tsx              # background_level.png watercolor scrim
        lesson/[theme]/page.tsx # kanji grid for a theme
        game/page.tsx           # answer round with timer
    auth/callback/route.ts      # OAuth code exchange
    icon.png                    # browser tab icon (replaces favicon.ico)
  components/
    HelpModal.tsx               # Win95-chrome tutorial modal
    HelpButton.tsx              # ❓ floating button (reading.png icon)
    BrandTypewriter.tsx         # romaji → kanji → hiragana → han-viet loop
    LocaleSwitcher.tsx          # vi ↔ en, preserves query string
    AttributionFooter.tsx       # env-driven GitHub icon + author credit
    features/
      auth/UserMenu.tsx         # avatar dropdown + tutorial reset
      play/                     # GameRound, LevelMap, KanjiSelector, …
      streak/                   # StreakBadge, HomeStreakStrip
  lib/
    supabase/{server,client}.ts # SSR + browser clients
    queries/{kanji,streak}.ts   # data access, server actions
    play/{answer,reading,stars} # validation logic (locale-aware)
    types/                      # shared TS types
  constants/                    # JLPT_LEVELS, LEVEL_COLORS, themes
  i18n/                         # next-intl config, navigation helpers
  context/auth-context.tsx      # client-side auth state
  hooks/useGameTimer.ts         # 30s round timer with started flag
messages/{vi,en}.json           # i18n bundles, kept in lockstep
scripts/
  seed-n5/                      # JMdict + KANJIDIC2 → n5-words.tsv → DB
  seed-n4/                      # next-N JMdict words per N5 kanji
data/seed/                      # generated TSVs (committed)
data/raw/                       # JMdict, KANJIDIC2, Unihan dumps (gitignored)
public/assets/                  # mascot.png, background_level.png, icons/
docs/PROJECT_STATUS.md          # living doc, updated after every PR
.claude/                        # hooks: guard-bash, guard-secrets, guard-hardcode
```

---

## Tech Stack

* **Language:** TypeScript 5.8 (strict)
* **Framework:** Next.js 15 (App Router, Turbopack dev, React Server Components by default), React 19
* **Styling:** Tailwind CSS 4 (`@tailwindcss/postcss`), CSS custom properties for theme tokens
* **Auth + Persistence:** Supabase Auth (Google OAuth, PKCE), Supabase Postgres with row-level security on every table
* **Server-side:** `@supabase/ssr` for cookie sessions in RSC + Route Handlers; service role key isolated to seed scripts and never imported into client code
* **i18n:** next-intl 4.12 (vi default, en supported), ICU plurals
* **Content sources:** JMdict + KANJIDIC2 (CC BY-SA 4.0, EDRDG), Unihan kVietnamese field for Hán-Việt readings
* **Deployment:** Vercel (preview per PR, production on `d_dev` merge to `main` flow not yet wired — manual promote)
* **Package manager:** npm

---

## Core Capabilities

The shipped surface area today. Pending items live in `docs/PROJECT_STATUS.md` and on GitHub issues.

| Capability | Status | Surface |
| --- | --- | --- |
| Watercolor home + brand typewriter (Romaji → 漢字道 → かんじどう → Hán Tự Đạo) | ✅ Shipped | `/` |
| Google OAuth sign-in (PKCE callback) with cookie sessions | ✅ Shipped | `/auth/login`, `/auth/callback` |
| `UserMenu` — avatar (Google `avatar_url`, fallback to initial), email, sign out, tutorial reset | ✅ Shipped | header dropdown |
| Lesson selector — 8 N5 themes (numbers, time, people, body, nature, place, verbs, daily_life) with completion stamps | ✅ Shipped | `/play` |
| Kanji grid per theme with level chips and "Sắp có" state for empty levels | ✅ Shipped | `/play/lesson/[theme]` |
| Level map — N5 → N1 cards on a dashed path; word counts per level; locale-aware labels (Sơ cấp / Beginner …) | ✅ Shipped | level map modal |
| Game round — 30s timer (starts after mode pick), Meaning ↔ Reading toggle, locale-aware answer validation | ✅ Shipped | `/play/game` |
| Reading mode — full word displayed with a dashed blank above the target kanji; accepts hiragana with `.`/`-`/`ー` folding and katakana fallback | ✅ Shipped | `/play/game?...&mode=reading` |
| Star grading — 3⭐ ≥20s, 2⭐ ≥10s, 1⭐ correct, 0⭐ wrong/timeout; best-per-(user, word) only upgrades | ✅ Shipped | `user_word_progress.best_stars` |
| Streak loop — `markWordCorrect` server action runs idempotent word progress, lesson stamping (≥5 distinct correct words), and streak transition | ✅ Shipped | `/play` 🔥 chip, `lessonComplete` banner, freeze toast |
| Streak rule — ≥1 lesson/day, freeze auto-grants every Monday, consumed when user misses exactly 1 day, reset on 3+ day gap | ✅ Shipped | `getUserStreak()` query |
| Home streak strip — comeback nudge when last_active_local_date ≠ today | ✅ Shipped | `/` (logged-in) |
| Tutorial system — Win95-chrome `HelpModal` per screen, first-time banner on `/play/game`, "Xem lại hướng dẫn" entry in `UserMenu` to reset onboarding | ✅ Shipped | `?` button on `/play`, `/play/lesson`, `/play/game` |
| i18n — vi default, en supported, locale switcher preserves query string on swap | ✅ Shipped | `LocaleSwitcher` |
| Footer attribution — env-driven GitHub icon + author credit; link disappears if `GITHUB_REPO_URL` / `GITHUB_AUTHOR` are unset | ✅ Shipped | every page |

### Reliability + safety features already in production

* **RLS on every table.** No table is queried without a policy. User-owned tables enforce `auth.uid() = user_id`; reference tables are public-read but never service-role from the client. `mcp__plugin_supabase_supabase__get_advisors security` is run after every schema migration.
* **Locale-aware answer validation.** `findWord()` returns both `meaning_vi` and `meaning_en`; `GamePage` picks one based on locale and falls through to the other if missing. `isAnswerCorrect()` splits both user input and stored meaning on `,;`, strips outer punctuation, lowercases, collapses whitespace, treats parens as optional clarification, and preserves Vietnamese diacritics (`tho phao` ≠ `thở phào`). 1062 N4 entries and 774 N5 entries all carry curated VI meanings.
* **Reading-mode normalization.** `normalizeReading()` folds katakana → hiragana, strips `.`/`-`/`ー`, and dedupes display readings. A user can type just the on-yomi or kun-yomi for the masked cell; the validator accepts any matching reading.
* **Idempotent server actions.** `markWordCorrect(theme, word, tz, timeLeftSec)` is safe to call multiple times — only the first correct attempt for a (user, theme, word) tuple counts toward lesson completion, and `best_stars` only upgrades.
* **Per-user IANA timezone for the day boundary.** Streak transitions use the user's local date, not server UTC, so a midnight crossing never costs someone their streak from the wrong side of the planet.
* **Hook-enforced security at edit time.** `.claude/hooks/guard-secrets.sh` scans the staged diff at `git commit` for high-entropy patterns (Stripe `sk_*`, Supabase `sb_secret_*`, JWTs, GitHub PATs, AWS keys, PEM private keys, `*_API_KEY = "..."` literals). `guard-hardcode.{sh,py}` blocks Supabase URLs, localhost URLs, and credential literals at Edit/Write time with an opt-out comment for legitimate cases. `guard-bash.sh` blocks Claude attribution in commit messages and PR bodies.

### Engineering decisions worth calling out

A few non-obvious choices a reviewer might want context on. Each is a deliberate trade-off, not a default.

* **JLPT-driven, not curriculum-driven.** Content is organized by N5 → N1 levels, not by Mina/Dekiru chapter order. Two reasons: copyright (Mina lesson order is theirs) and scope creep (the moat is the per-kanji deep-dive, not yet another textbook port). A "Mina mapping" preset is post-MVP.
* **One kanji deep-dive is the moat.** Pick a kanji → see every compound across N5..N1 → play on the chosen word. No competitor does this on the public market. The whole UX is shaped to make this single flow feel inevitable; lesson selector and theme grouping are scaffolding around it.
* **Vietnamese-first, international-ready from day one.** All UI strings ship in `messages/vi.json` + `messages/en.json` in the same commit. Hán-Việt readings are first-class in the data model — they're a competitive moat for VN users, and stripping them later would mean re-curating thousands of rows. EN gloss falls back to VI gloss when missing, never the other way around (because VN is the default audience).
* **Aesthetic is the moat — but never publicly called "Ghibli".** The watercolor Japanese street + Win95 modal accent is the visual signature. Public copy says "soft watercolor Japanese aesthetic" or "warm illustrated Japan". AI-generated art for MVP; commission a real artist before public launch.
* **N4 vocab seeded as a follow-up layer over the N5 kanji set.** `scripts/seed-n4/build.ts` takes JMdict ranks 9..20 for each N5 kanji and tags them `jlpt_level=N4`. JMdict-simplified doesn't expose a true JLPT level, so the rank is a proxy and we accept the imprecision. Revisit when N4 *kanji* (not just words) ship — the data model already supports it.
* **Env-driven attribution, no hardcoded URLs.** The footer GitHub icon and author credit are gated on `process.env.GITHUB_REPO_URL` and `process.env.GITHUB_AUTHOR` — both server-only (no `NEXT_PUBLIC_` prefix), both optional. If they're unset the link disappears. Hardcoding the repo URL into the source would make the project unsafe to fork, and the `guard-hardcode` hook blocks the pattern at edit time.
* **No tier-unlock gate, only data-presence gate.** Levels show "Sắp có" / "Coming soon" when no words are seeded for that (kanji, level) pair. Users are never blocked by progress — anyone can jump to N1 if data exists. Game design call: addictive but not paternalistic; the streak loop is the retention hook, not artificial level gates.

### Workflow loop

Every change goes through the same loop: brainstorm in chat → feature branch named `datvt/<type>_<topic>` (`feat`, `fix`, `chore`, `docs`) → conventional commit subject ≤72 chars → PR against `d_dev` (never `main`) with **Summary** + **Test plan** sections → squash-merge, delete branch, sync `d_dev` before next task. Hooks enforce: no Claude attribution anywhere, no `--no-verify`, no force-push to `main`/`master`/`d_dev`, no staged secrets. Documented in `CLAUDE.md` and the project hook configs.

### Seeding the database

Vocabulary is built offline from public datasets (JMdict + KANJIDIC2 from EDRDG, Unihan from Unicode) and inserted into Supabase by idempotent scripts. Re-running is safe — only new (word, reading) pairs are inserted, only new kanji_words links are created.

```bash
# N5 — full pipeline (downloads dumps if missing, builds TSV, inserts)
npm run seed:download
npm run seed:build
npm run seed:db

# N4 — follow-up layer over the same N5 kanji set
npm run seed:n4:build      # writes data/seed/n4-words.tsv
npm run seed:n4:db         # inserts new pairs only, never re-touches N5
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The service role key is **only** used by these scripts; the runtime app uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon JWT) and goes through RLS.

---

## Getting Started

Two supported paths: local dev (fastest feedback loop) and Vercel preview (closer to production with the real CDN + edge runtime).

### Prerequisites
* Node.js 20+
* npm 10+ (or your preferred package manager — the lock file is npm)
* A Supabase project (free tier is plenty). Project ref + publishable key go in `.env.local`.

### 1. Clone & configure environment

```bash
git clone <your fork URL>
cd kanji-games-client-site

cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — required. From Supabase **Project Settings → API**.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — required. The new `sb_publishable_...` key (or fall back to the legacy anon JWT).
- `SUPABASE_SERVICE_ROLE_KEY` — only required if you want to seed the database yourself. Never commit. Never used by the runtime app.
- `GITHUB_REPO_URL` — optional. Server-only (no `NEXT_PUBLIC_` prefix). When set, the footer renders a GitHub icon linking to the repo.
- `GITHUB_AUTHOR` — optional. Server-only. When set, the footer renders the author credit.

`.env.local` is gitignored. `.env.example` is the template — committed, no real values.

### 2. Local dev

```bash
npm install
npm run dev
```

URLs:
- Frontend: <http://localhost:3000>
- Default locale (`vi`): <http://localhost:3000/vi> — the middleware redirects `/` → `/vi`.

### 3. Build + production preview

```bash
npm run build    # next build with Turbopack — typecheck + lint + bundle
npm run start    # serves the built output locally
npm run typecheck   # tsc --noEmit standalone
npm run lint        # next lint (will migrate to ESLint CLI before Next 16)
```

The `build` step is the canonical "is this PR shippable" check — it runs the typechecker and lint as part of the pipeline. CI runs the same command.

### Authentication (Supabase + Google)

Anonymous works for the home page and the kanji selector. The streak loop, lesson stamps, and per-user star grading require sign-in.

To enable real sign-in:

1. Create a Supabase project at <https://supabase.com>. From **Project Settings → API**, copy `URL` and the publishable key into `.env.local` (already covered above).
2. In **Authentication → Providers**, enable Google. Paste the OAuth client ID + secret from your Google Cloud Console (OAuth consent screen + Web Application credentials).
3. Add allowed redirect URLs in Supabase **Authentication → URL Configuration**:
   - `http://localhost:3000/auth/callback` (local dev)
   - your Vercel preview URL pattern + production callback once those domains exist.
4. Set the **Site URL** to your production domain (not `localhost:3000`) — otherwise prod sign-ins redirect back to localhost. This bit me once; it's now in `docs/PROJECT_STATUS.md`.
5. Restart `npm run dev`. The header now shows **Đăng nhập** / **Sign in** for anonymous users and the avatar dropdown for signed-in users.

Signed-in users get streak tracking, lesson stamps, star grading per word, and the comeback strip on the home page. All four panels live behind RLS — the `auth.uid() = user_id` policy means a logged-out user can never see another user's data, even with a leaked publishable key.

### CI/CD

Pre-flight runs locally on every commit via the `.claude/hooks/` set. CI proper is intentionally light for solo-dev velocity: GitHub Actions runs `npm run build` on PRs against `d_dev`, and Vercel auto-deploys preview URLs per PR. Production promotion is manual until the user base justifies an automated pipeline.

Recommended fastest path for first user feedback:
- keep PR previews on Vercel — share the URL with testers
- merge to `d_dev` when stable, promote to `main` manually
- use the platform-generated URL first; add a custom domain (`kanjido.app`) once trademark registration is filed

---

## Content Quality & Safety

To guarantee learners aren't fed nonsense, the system implements:

* **Curated VI meanings on every word.** Both N5 (774) and N4 (1062) entries carry hand-checked `meaning_vi`. Locale fallback is one-way (EN → VI is rejected; VI → EN is allowed) so a Vietnamese user never sees an English answer when playing in Vietnamese.
* **Multi-variant answer matching.** Every meaning string is split on `,;` so a stored value like `"hai, đôi"` accepts either `hai` or `đôi`. Parens are treated as optional clarification — `ba (cái)`, `ba cái`, and `ba` all match.
* **Footer attribution required.** JMdict + KANJIDIC2 are CC BY-SA 4.0 (EDRDG) and Unihan is © Unicode, Inc. — both credited in the footer on every page, every locale.

---

## License

Source code: [PolyForm Noncommercial 1.0.0](./LICENSE.md). Free for personal study, classroom use, academic research, and unpaid open-source experimentation. **Any commercial use requires a separate written agreement** — see [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md) and email vuthanhdat181@gmail.com.

The "Kanjido" name, the 漢字道 wordmark, and the mascot are not licensed under PolyForm and remain reserved.

---

*Built by Vu Thanh Dat (ヴ・タイン・ダット) — solo-dev showcase of how far a single Next.js + Supabase repo can carry a product before it needs to grow up.*
