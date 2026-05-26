/**
 * Generate a stub data/seed/n5-vi-meanings.json from the current TSV.
 *
 * Shape: one entry per unique word, sorted by kanji_char then by frequency_rank
 * for easy review. Each entry shows reading + en gloss as context for the
 * translator (Claude or human) to write `vi`.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const TSV = path.join(ROOT, "data/seed/n5-words.tsv");
const OUT = path.join(ROOT, "data/seed/n5-vi-meanings.json");

interface Entry {
  reading: string;
  pos: string;
  en: string;
  rank: number;
  kanjiChars: string[];
  vi: string;
}

async function loadExisting(): Promise<Record<string, Entry>> {
  try {
    await access(OUT);
    return JSON.parse(await readFile(OUT, "utf8")) as Record<string, Entry>;
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const tsv = await readFile(TSV, "utf8");
  const lines = tsv.trim().split("\n").slice(1);
  const existing = await loadExisting();
  const out: Record<string, Entry> = {};

  for (const line of lines) {
    const [kanjiChar, word, reading, pos, en, rank] = line.split("\t");
    const prev = out[word];
    if (prev) {
      if (!prev.kanjiChars.includes(kanjiChar)) prev.kanjiChars.push(kanjiChar);
      continue;
    }
    out[word] = {
      reading,
      pos,
      en,
      rank: Number(rank),
      kanjiChars: [kanjiChar],
      vi: existing[word]?.vi ?? "",
    };
  }

  const sorted = Object.entries(out).sort(([, a], [, b]) => a.rank - b.rank);
  const ordered: Record<string, Entry> = {};
  for (const [k, v] of sorted) ordered[k] = v;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(ordered, null, 2) + "\n", "utf8");

  const total = Object.keys(ordered).length;
  const filled = Object.values(ordered).filter((e) => e.vi.trim() !== "").length;
  console.log(`wrote ${OUT}`);
  console.log(`  total unique words: ${total}`);
  console.log(`  with vi filled:     ${filled}`);
  console.log(`  remaining:          ${total - filled}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
