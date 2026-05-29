const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;

export function katakanaToHiragana(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 0x30a1 && code <= 0x30f6) {
      out += String.fromCharCode(code - KATAKANA_TO_HIRAGANA_OFFSET);
    } else {
      out += ch;
    }
  }
  return out;
}

export function normalizeReading(s: string): string {
  return katakanaToHiragana(s)
    .replace(/[.\-‐ー]/g, "")
    .trim()
    .toLowerCase();
}

export function buildReadingSet(
  on: readonly string[],
  kun: readonly string[]
): Set<string> {
  const set = new Set<string>();
  for (const r of [...on, ...kun]) {
    const n = normalizeReading(r);
    if (n) set.add(n);
  }
  return set;
}

export function isReadingCorrect(
  userInput: string,
  on: readonly string[],
  kun: readonly string[]
): boolean {
  const input = normalizeReading(userInput);
  if (!input) return false;
  return buildReadingSet(on, kun).has(input);
}
