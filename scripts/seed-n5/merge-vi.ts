/**
 * Merge data/seed/n5-vi-meanings.json into data/seed/n5-words.tsv as a new
 * trailing `vi_meaning` column. Run after editing the JSON.
 *
 * Output:
 *   kanji_char  word  reading  pos  en_gloss  frequency_rank  han_viet  vi_meaning
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const TSV = path.join(ROOT, "data/seed/n5-words.tsv");
const VI = path.join(ROOT, "data/seed/n5-vi-meanings.json");
const OUT = path.join(ROOT, "data/seed/n5-words-with-vi.tsv");

interface ViEntry {
  vi: string;
}

async function main(): Promise<void> {
  const [tsv, viJson] = await Promise.all([
    readFile(TSV, "utf8"),
    readFile(VI, "utf8"),
  ]);
  const dict = JSON.parse(viJson) as Record<string, ViEntry>;

  const lines = tsv.trim().split("\n");
  const header = lines[0] + "\tvi_meaning";
  const merged = [header];
  let missing = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    const word = cols[1];
    const vi = dict[word]?.vi ?? "";
    if (!vi) missing++;
    merged.push([...cols, vi].join("\t"));
  }

  await writeFile(OUT, merged.join("\n") + "\n", "utf8");
  console.log(`wrote ${OUT}`);
  console.log(`  rows:    ${merged.length - 1}`);
  console.log(`  missing: ${missing}`);
  if (missing > 0) {
    console.log(`  ⚠ run with all entries filled before seeding the DB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
