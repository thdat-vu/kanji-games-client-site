/**
 * Build the N5 kanji seed table: data/seed/n5-kanji.tsv
 *
 * Inputs (data/raw, populated by download.ts):
 *   - kanjidic2-en-3.6.2.json   → 103 N5 kanji + readings/meanings/strokes/radical
 *   - Unihan_Readings.txt        → kVietnamese (Hán-Việt) per CJK codepoint
 *   - data/seed/n5-kanji-vi-translations.tsv (optional) → meaning_vi per char
 *
 * Output columns:
 *   char  jlpt_level  stroke_count  radical  on_readings  kun_readings  meaning_en  han_viet  meaning_vi
 *
 * Array columns are pipe-delimited (`|`) inside the TSV cell to avoid TSV ambiguity;
 * seed-db.ts splits on `|` before INSERT.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "data/raw");
const OUT_DIR = path.join(ROOT, "data/seed");
const OUT_FILE = path.join(OUT_DIR, "n5-kanji.tsv");
const VI_FILE = path.join(OUT_DIR, "n5-kanji-vi-translations.tsv");

interface KanjidicChar {
  literal: string;
  radicals: Array<{ type: string; value: number }>;
  misc: {
    jlptLevel: number | null;
    strokeCounts: number[];
  };
  readingMeaning?: {
    groups: Array<{
      readings: Array<{ type: string; value: string }>;
      meanings: Array<{ lang: string; value: string }>;
    }>;
  };
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

function tsvCell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

async function loadViDict(): Promise<Map<string, string>> {
  const dict = new Map<string, string>();
  try {
    await access(VI_FILE);
  } catch {
    return dict;
  }
  const text = await readFile(VI_FILE, "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const char = line.slice(0, tab);
    const vi = line.slice(tab + 1).trim();
    if (vi) dict.set(char, vi);
  }
  return dict;
}

async function main(): Promise<void> {
  const [kanjidicJson, unihanText, viDict] = await Promise.all([
    readFile(path.join(RAW, "kanjidic2-en-3.6.2.json"), "utf8"),
    readFile(path.join(RAW, "Unihan_Readings.txt"), "utf8"),
    loadViDict(),
  ]);
  const kanjidic = JSON.parse(kanjidicJson) as { characters: KanjidicChar[] };
  const hanViet = parseUnihanVietnamese(unihanText);

  const n5 = kanjidic.characters.filter((c) => c.misc.jlptLevel === 4);
  console.log(`N5 kanji: ${n5.length}`);

  const lines = [
    [
      "char",
      "jlpt_level",
      "stroke_count",
      "radical",
      "on_readings",
      "kun_readings",
      "meaning_en",
      "han_viet",
      "meaning_vi",
    ].join("\t"),
  ];

  let missingHv = 0;
  let missingVi = 0;
  for (const c of n5) {
    const grp = c.readingMeaning?.groups[0];
    const onReadings: string[] = [];
    const kunReadings: string[] = [];
    const meanings: string[] = [];
    if (grp) {
      for (const r of grp.readings) {
        if (r.type === "ja_on") onReadings.push(r.value);
        else if (r.type === "ja_kun") kunReadings.push(r.value);
      }
      for (const m of grp.meanings) {
        if (m.lang === "en") meanings.push(m.value);
      }
    }

    const radical =
      c.radicals.find((r) => r.type === "classical")?.value ??
      c.radicals[0]?.value ??
      0;
    const strokes = c.misc.strokeCounts[0] ?? 0;
    const hv = hanViet.get(c.literal) ?? "";
    if (!hv) missingHv++;
    const vi = viDict.get(c.literal) ?? "";
    if (!vi) missingVi++;

    lines.push(
      [
        c.literal,
        "N5",
        String(strokes),
        String(radical),
        onReadings.join("|"),
        kunReadings.join("|"),
        tsvCell(meanings.join("; ")),
        hv,
        tsvCell(vi),
      ].join("\t"),
    );
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, lines.join("\n") + "\n", "utf8");
  console.log(`wrote ${OUT_FILE}`);
  console.log(`  rows:        ${lines.length - 1}`);
  console.log(`  missing hv:  ${missingHv}`);
  console.log(`  missing vi:  ${missingVi}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
