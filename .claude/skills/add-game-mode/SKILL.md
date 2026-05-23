---
name: add-game-mode
description: Scaffold a new mini-game type (route, component, types, i18n keys) following the existing GameRound pattern. Use when adding a new way to practice a kanji/word.
---

# Add a new game mode

The app's moat is variety per kanji. Each new mode = another reason to come back.

## Existing modes
- **meaning-guess** — show word + reading, user types meaning. See [src/components/features/play/GameRound.tsx](src/components/features/play/GameRound.tsx)

## Candidate next modes (in priority order)
1. **reading-guess** — show word + meaning, user types reading (hiragana)
2. **listen-pick** — play TTS audio, user picks correct kanji from 4 options
3. **compose** — show meaning, user assembles kanji from radicals/parts
4. **flashcard-srs** — spaced-repetition review of known words

## Scaffold checklist

When adding mode `<mode-id>`:

1. **Route**: `src/app/play/game/<mode-id>/page.tsx` (Server Component, parses query params, renders client component)
2. **Component**: `src/components/features/play/<ModeId>Round.tsx` (`'use client'`)
3. **Type**: extend the discriminated union in `src/lib/types/game.ts`:
   ```ts
   type GameMode = 'meaning-guess' | 'reading-guess' | '<mode-id>'
   ```
4. **Mode picker entry**: add to the level-map UI (or a mode selector before the round)
5. **i18n keys**: add `play.modes.<modeId>.{title,instruction,placeholder}` to BOTH `messages/vi.json` and `messages/en.json`
6. **Validation logic**: pure function in `src/lib/game/validate-<mode-id>.ts` + co-located test
7. **Progress write**: on round complete, insert row into `attempts` table (kanji_char, word_id, mode, correct, duration_ms)

## Reuse, don't re-invent
- Timer: extract from current `GameRound` into `useCountdown(seconds)` hook *only if 2nd mode needs it*. Premature otherwise.
- Result modal: same — extract on 2nd usage, not 1st.

## Don't do
- Don't make a "GenericGameEngine" abstraction. Three concrete modes first.
- Don't add a difficulty selector before the modes themselves are stable.
- Don't gate any N5 mode behind premium. Free tier must feel complete at N5.
