---
name: seed-kanji
description: Import open kanji datasets (KANJIDIC2 / JMdict / davidluzgouveia/kanji-data) into Supabase. Use when seeding or refreshing the kanji + vocabulary tables.
---

# Seed kanji data into Supabase

## When to use
- Setting up the database for the first time
- Adding a new JLPT level (e.g., we shipped N5, now adding N4)
- Refreshing kanji or vocab data

## Sources (in priority order)

1. **JLPT level mapping** — [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) `kanji-jouyou.json` (MIT)
2. **Kanji metadata (readings, meaning, stroke, radical)** — [scriptin/jmdict-simplified](https://github.com/scriptin/jmdict-simplified) `kanjidic2-en-3.x.x.json` (CC-BY-SA, EDRDG)
3. **Vocabulary** — same repo `jmdict-eng-common-3.x.x.json` (filter by `commonness` + JLPT level)
4. **Vietnamese meanings + Hán-Việt** — manual curation in `data/vi-overrides.json`

## License obligations
- KANJIDIC2 & JMdict are **CC-BY-SA + EDRDG license** → app footer must credit `Powered by KANJIDIC2/JMdict — Electronic Dictionary Research and Development Group`.
- Don't redistribute the raw XML files in our repo; use JSON conversions and link back.

## Schema (target tables)

```
kanji            (char PK, jlpt_level, stroke_count, radical, on_readings text[], kun_readings text[], meaning_en, meaning_vi, han_viet)
words            (id PK, word, reading, jlpt_level, meaning_en, meaning_vi, frequency_rank)
kanji_words      (kanji_char FK, word_id FK)  -- many-to-many
```

All tables: `enable row level security`, `select` policy = `true` (public read), no public writes.

## Pipeline

1. Download source JSON to `scripts/seed/data/` (gitignored).
2. Run `scripts/seed/build-vocab.ts` → produces `seed.sql` filtered to the JLPT level we're seeding.
3. Apply via Supabase MCP `apply_migration` (don't run raw `execute_sql` for DDL).
4. Verify: `select count(*) from kanji where jlpt_level = 'N5'` should be ~80.
5. Run `mcp__plugin_supabase_supabase__get_advisors` (security + performance) — fix anything flagged.

## Phase scope
Phase 1: N5 only (~80 kanji, ~600 words). Do NOT seed N1-N4 in the same migration.

## Anti-patterns
- ❌ Don't paste vocab from Mina no Nihongo / Dekiru — copyrighted curriculum
- ❌ Don't seed >1000 rows in a single migration — split per JLPT level
- ❌ Don't store readings as comma-strings — use `text[]` so we can query "kanji whose onyomi includes X"
