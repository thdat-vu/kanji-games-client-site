/**
 * Build the N4 seed table: data/seed/n4-words.tsv
 *
 * Strategy (MVP, locked 2026-05-29):
 *   For each N5 kanji we already seeded the top-8 most frequent JMdict words.
 *   N4 = the next 12 ranked common words (rank 9..20) for the same kanji set,
 *   minus anything already in n5-words.tsv. These are usually less frequent
 *   compounds that still feature an N5 char — gives the level map content to
 *   unlock without standing up an N4 kanji set + theme map.
 *
 *   This is a pragmatic mapping: a word's "true" JLPT level is fixed by the
 *   dictionary, but JMdict-simplified does not expose that. We tag everything
 *   in this script as jlpt_level=N4 and accept the imprecision; revisit when
 *   N4 kanji ship.
 *
 * Inputs (data/raw):
 *   - jmdict-eng-common-3.6.2.json
 *   - kanjidic2-en-3.6.2.json
 *   - Unihan_Readings.txt
 *   - data/seed/n5-words.tsv (to deduplicate)
 *
 * Output columns (same schema as n5-words.tsv):
 *   kanji_char  word  reading  pos  en_gloss  frequency_rank  han_viet
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "data/raw");
const SEED_DIR = path.join(ROOT, "data/seed");
const N5_WORDS_TSV = path.join(SEED_DIR, "n5-words.tsv");
const OUT_FILE = path.join(SEED_DIR, "n4-words.tsv");

const TARGET_PER_KANJI = 12;

interface KanjidicChar {
  literal: string;
  misc: { jlptLevel: number | null };
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
    const isHan =
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x20000 && cp <= 0x2a6df);
    if (!isHan) continue;
    parts.push(dict.get(ch) ?? "?");
  }
  return parts.join(" ");
}

function tsvEscape(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

async function loadN5Pairs(): Promise<Set<string>> {
  const text = await readFile(N5_WORDS_TSV, "utf8");
  const lines = text.trim().split("\n");
  const headers = lines[0].split("\t");
  const wordIdx = headers.indexOf("word");
  const readingIdx = headers.indexOf("reading");
  const set = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    set.add(`${cols[wordIdx]} ${cols[readingIdx]}`);
  }
  return set;
}

async function main(): Promise<void> {
  console.log("loading datasets...");
  const [kanjidicJson, jmdictJson, unihanText, n5Pairs] = await Promise.all([
    readFile(path.join(RAW, "kanjidic2-en-3.6.2.json"), "utf8"),
    readFile(path.join(RAW, "jmdict-eng-common-3.6.2.json"), "utf8"),
    readFile(path.join(RAW, "Unihan_Readings.txt"), "utf8"),
    loadN5Pairs(),
  ]);
  const kanjidic = JSON.parse(kanjidicJson) as { characters: KanjidicChar[] };
  const jmdict = JSON.parse(jmdictJson) as { words: JmdictWord[] };
  const hanViet = parseUnihanVietnamese(unihanText);

  const n5Chars = kanjidic.characters
    .filter((c) => c.misc.jlptLevel === 4)
    .map((c) => c.literal);
  const n5Set = new Set(n5Chars);
  console.log(`N5 kanji: ${n5Chars.length}`);
  console.log(`N5 (word,reading) pairs already seeded: ${n5Pairs.size}`);

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
      if (n5Pairs.has(`${form.text} ${reading}`)) continue;
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
  let withWords = 0;
  for (const ch of n5Chars) {
    const bucket = buckets.get(ch)!;
    bucket.sort((a, b) => a.rank - b.rank);
    const top = bucket.slice(0, TARGET_PER_KANJI);
    if (top.length > 0) withWords++;
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

  await mkdir(SEED_DIR, { recursive: true });
  await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf8");
  console.log(`wrote ${OUT_FILE}`);
  console.log(`  total N4 word rows (per-kanji links): ${totalWords}`);
  console.log(`  N5 kanji with N4 follow-ups: ${withWords}/${n5Chars.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
