/**
 * Read data/seed/n5-vi-translations.tsv (`word\tvi`) and write the `vi` field
 * into data/seed/n5-vi-meanings.json. Idempotent: existing non-empty vi values
 * are overwritten by the TSV, blank TSV cells leave the JSON value untouched.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const JSON_PATH = path.join(ROOT, "data/seed/n5-vi-meanings.json");
const TSV_PATH = path.join(ROOT, "data/seed/n5-vi-translations.tsv");

interface Entry {
  reading: string;
  pos: string;
  en: string;
  rank: number;
  kanjiChars: string[];
  vi: string;
}

async function main(): Promise<void> {
  const [jsonRaw, tsvRaw] = await Promise.all([
    readFile(JSON_PATH, "utf8"),
    readFile(TSV_PATH, "utf8"),
  ]);
  const data = JSON.parse(jsonRaw) as Record<string, Entry>;

  const map = new Map<string, string>();
  for (const line of tsvRaw.trim().split("\n")) {
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const word = line.slice(0, tab);
    const vi = line.slice(tab + 1).trim();
    if (vi) map.set(word, vi);
  }

  let updated = 0;
  let unknown = 0;
  for (const [word, entry] of Object.entries(data)) {
    const vi = map.get(word);
    if (vi !== undefined) {
      entry.vi = vi;
      updated++;
    } else if (!entry.vi) {
      unknown++;
    }
  }

  for (const word of map.keys()) {
    if (!(word in data)) {
      console.warn(`  ⚠ TSV has '${word}' but JSON does not`);
    }
  }

  await writeFile(JSON_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`updated ${updated} entries`);
  console.log(`  still empty: ${unknown}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
