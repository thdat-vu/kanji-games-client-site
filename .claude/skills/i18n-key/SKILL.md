---
name: i18n-key
description: Add a new i18n translation key in BOTH vi.json and en.json in the same edit, never one without the other. Use whenever introducing user-facing copy.
---

# Add an i18n key

## Rule
**Never ship a VI-only string.** Even if EN translation is rough, it must exist. Reasons:
- Missing keys break `next-intl` at runtime
- Product Hunt / Reddit launches need EN landing the day-of, not "soon"
- Forces us to think in 2 languages (catches Vietnamese-only idioms)

## Procedure

For key `<namespace>.<keyName>`:

1. Edit `messages/vi.json` — add the Vietnamese copy
2. Edit `messages/en.json` — add the English copy in the SAME nested path
3. (Optional) `messages/ja.json` if it exists — Japanese for native fluency check
4. Use the key via:
   ```tsx
   import { useTranslations } from 'next-intl'
   const t = useTranslations('namespace')
   return <button>{t('keyName')}</button>
   ```

## Naming
- `landing.hero.tagline` — namespace by page/feature
- `play.cta.start` — verbs for buttons
- `play.modes.meaningGuess.instruction` — camelCase leaves; kebab-case modes ↔ camelCase keys
- Keep keys < 4 levels deep

## Anti-patterns
- ❌ Hardcoding strings in JSX (find/replace must work later)
- ❌ Storing translations in `LABELS` constants (legacy, being phased out — see [src/constants/constants.ts](src/constants/constants.ts))
- ❌ Concatenating translated fragments (`t('greet') + ' ' + name`) — use ICU placeholders: `t('greet', { name })`
- ❌ One language ahead of the other "for now"
