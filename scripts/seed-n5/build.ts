/**
 * Build the N5 seed table: data/seed/n5-words.tsv
 *
 * Inputs (data/raw, populated by download.ts):
 *   - kanjidic2-en-3.6.2.json     → N5 kanji set + readings/meanings
 *   - jmdict-eng-common-3.6.2.json → top-~12k Japanese words with English glosses
 *   - Unihan_Readings.txt          → kVietnamese readings per CJK codepoint
 *
 * Selection rules (locked 2026-05-23):
 *   - N5 = kanjidic2 jlptLevel === 4  (Old JLPT N5, ~103 chars; closest to current N5 list)
 *   - Pick words from jmdict common file whose primary kanji form contains the target char
 *   - Adaptive cap: aim for 8 words/kanji; allow 6–12 depending on availability
 *   - frequency_rank = ordinal index of the entry in jmdict-common (proxy for nfXX rank
 *     since simplified format collapses priority tags into a `common: true/false` boolean)
 *
 * Output columns:
 *   kanji_char  word  reading  pos  en_gloss  frequency_rank  han_viet
 * (vi_meaning is added later in PR-2.)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "data/raw");
const OUT_DIR = path.join(ROOT, "data/seed");
const OUT_FILE = path.join(OUT_DIR, "n5-words.tsv");

const TARGET_PER_KANJI = 8;
const MIN_PER_KANJI = 6;

interface KanjidicChar {
  literal: string;
  misc: { jlptLevel: number | null };
  readingMeaning?: {
    groups: Array<{
      readings: Array<{ type: string; value: string }>;
      meanings: Array<{ lang: string; value: string }>;
    }>;
  };
}

interface JmdictWord {
  id: string;
  kanji: Array<{ common: boolean; text: string; tags: string[] }>;
  kana: Array<{ common: boolean; text: string; tags: string[]; appliesToKanji: string[] }>;
  sense: Array<{
    partOfSpeech: string[];
    appliesToKanji: string[];
    gloss: Array<{ lang: string; text: string }>;
  }>;
}

const SKIP_KANJI_TAGS = new Set(["iK", "io", "oK", "ok", "rK", "sK", "ateji"]);

function pickKanjiForm(
  word: JmdictWord,
  target: string,
): { text: string; index: number } | null {
  for (let i = 0; i < word.kanji.length; i++) {
    const k = word.kanji[i];
    if (!k.common) continue;
    if (k.tags.some((t) => SKIP_KANJI_TAGS.has(t))) continue;
    if (k.text.includes(target)) return { text: k.text, index: i };
  }
  return null;
}

function pickReading(word: JmdictWord, kanjiForm: string): string | null {
  for (const r of word.kana) {
    if (!r.common) continue;
    const applies = r.appliesToKanji;
    if (applies.includes("*") || applies.includes(kanjiForm)) return r.text;
  }
  return word.kana[0]?.text ?? null;
}

function pickSense(word: JmdictWord, kanjiForm: string): JmdictWord["sense"][number] | null {
  for (const s of word.sense) {
    if (s.appliesToKanji.includes("*") || s.appliesToKanji.includes(kanjiForm)) return s;
  }
  return word.sense[0] ?? null;
}

function parseUnihanVietnamese(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [code, field, value] = line.split("\t");
    if (field !== "kVietnamese" || !code || !value) continue;
    const cp = parseInt(code.replace(/^U\+/, ""), 16);
    if (Number.isNaN(cp)) continue;
    map.set(String.fromCodePoint(cp), value.trim().split(/\s+/)[0]);
  }
  return map;
}

function joinHanViet(kanjiText: string, dict: Map<string, string>): string {
  const parts: string[] = [];
  for (const ch of [...kanjiText]) {
    const cp = ch.codePointAt(0)!;
    // Skip kana (hiragana 0x3040-0x309F, katakana 0x30A0-0x30FF, prolonged 0x30FC, halfwidth 0xFF65-0xFF9F)
    // and any other non-CJK ideograph. We only emit Hán-Việt for actual Han chars.
    const isHan =
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Ext A
      (cp >= 0x20000 && cp <= 0x2a6df); // CJK Ext B (kept narrow; N5 won't use these)
    if (!isHan) continue;
    parts.push(dict.get(ch) ?? "?");
  }
  return parts.join(" ");
}

function tsvEscape(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

async function main(): Promise<void> {
  console.log("loading datasets...");
  const [kanjidicJson, jmdictJson, unihanText] = await Promise.all([
    readFile(path.join(RAW, "kanjidic2-en-3.6.2.json"), "utf8"),
    readFile(path.join(RAW, "jmdict-eng-common-3.6.2.json"), "utf8"),
    readFile(path.join(RAW, "Unihan_Readings.txt"), "utf8"),
  ]);
  const kanjidic = JSON.parse(kanjidicJson) as { characters: KanjidicChar[] };
  const jmdict = JSON.parse(jmdictJson) as { words: JmdictWord[] };
  const hanViet = parseUnihanVietnamese(unihanText);

  const n5Chars = kanjidic.characters.filter((c) => c.misc.jlptLevel === 4);
  const n5Set = new Set(n5Chars.map((c) => c.literal));
  console.log(`N5 kanji: ${n5Chars.length}`);
  console.log(`Hán-Việt entries from Unihan: ${hanViet.size}`);

  const buckets = new Map<string, Array<{
    word: string;
    reading: string;
    pos: string;
    en: string;
    rank: number;
  }>>();
  for (const ch of n5Set) buckets.set(ch, []);

  for (let i = 0; i < jmdict.words.length; i++) {
    const w = jmdict.words[i];
    if (w.kanji.length === 0) continue;
    for (const ch of n5Set) {
      const bucket = buckets.get(ch)!;
      const form = pickKanjiForm(w, ch);
      if (!form) continue;
      const reading = pickReading(w, form.text);
      const sense = pickSense(w, form.text);
      if (!reading || !sense) continue;
      const en = sense.gloss
        .filter((g) => g.lang === "eng")
        .map((g) => g.text)
        .join("; ");
      if (!en) continue;
      const pos = sense.partOfSpeech[0] ?? "";
      bucket.push({ word: form.text, reading, pos, en, rank: i + 1 });
    }
  }

  const lines = [
    ["kanji_char", "word", "reading", "pos", "en_gloss", "frequency_rank", "han_viet"].join("\t"),
  ];
  let totalWords = 0;
  let undersized = 0;
  let perfect = 0;
  for (const ch of n5Chars.map((c) => c.literal)) {
    const bucket = buckets.get(ch)!;
    bucket.sort((a, b) => a.rank - b.rank);
    const top = bucket.slice(0, TARGET_PER_KANJI);
    if (top.length < MIN_PER_KANJI) undersized++;
    if (top.length >= TARGET_PER_KANJI) perfect++;
    for (const e of top) {
      lines.push(
        [
          ch,
          e.word,
          e.reading,
          e.pos,
          tsvEscape(e.en),
          String(e.rank),
          joinHanViet(e.word, hanViet),
        ].join("\t"),
      );
      totalWords++;
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf8");
  console.log(`wrote ${OUT_FILE}`);
  console.log(`  total words: ${totalWords}`);
  console.log(`  kanji at/above target (${TARGET_PER_KANJI}): ${perfect}/${n5Chars.length}`);
  console.log(`  kanji below min (${MIN_PER_KANJI}): ${undersized}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
