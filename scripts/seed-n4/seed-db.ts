/**
 * Seed N4 follow-up words into Supabase.
 *
 * Reads:  data/seed/n4-words.tsv
 * Writes: public.words (jlpt_level='N4') + public.kanji_words links
 *
 * Skips rows whose (word, reading) pair already exists at any level — N4 is
 * just an extra unlock layer over the N5 kanji set, not a fresh import.
 *
 * Idempotent: rerunning only inserts new pairs. Does NOT touch N5 rows.
 *
 * Requires (in .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WORDS_TSV = path.join(ROOT, "data/seed/n4-words.tsv");
const BATCH = 500;

interface WordTsvRow {
  kanji_char: string;
  word: string;
  reading: string;
  pos: string;
  en_gloss: string;
  frequency_rank: string;
  han_viet: string;
}

async function loadEnv(): Promise<void> {
  const envPath = path.join(ROOT, ".env.local");
  const text = await readFile(envPath, "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseTsv<T extends Record<string, string>>(text: string): T[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split("\t");
  const rows: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j] ?? "";
    rows.push(row as T);
  }
  return rows;
}

async function main(): Promise<void> {
  await loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const wordsText = await readFile(WORDS_TSV, "utf8");
  const tsvRows = parseTsv<WordTsvRow>(wordsText);
  console.log(`load N4 word rows: ${tsvRows.length}`);

  // Pull every (word, reading) already in the DB so we never duplicate.
  const existingPairs = new Map<string, number>();
  let from = 0;
  for (;;) {
    const { data, error } = await sb
      .from("words")
      .select("id, word, reading")
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) existingPairs.set(`${r.word} ${r.reading}`, r.id);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`existing (word, reading) in DB: ${existingPairs.size}`);

  const wordKey = (w: string, r: string) => `${w} ${r}`;
  const newWords = new Map<
    string,
    Pick<
      WordTsvRow,
      "word" | "reading" | "en_gloss" | "frequency_rank" | "han_viet"
    >
  >();
  for (const r of tsvRows) {
    const k = wordKey(r.word, r.reading);
    if (existingPairs.has(k)) continue;
    if (!newWords.has(k)) {
      newWords.set(k, {
        word: r.word,
        reading: r.reading,
        en_gloss: r.en_gloss,
        frequency_rank: r.frequency_rank,
        han_viet: r.han_viet,
      });
    }
  }
  console.log(`new N4 words to insert: ${newWords.size}`);

  const wordIdByKey = new Map<string, number>(existingPairs);
  const uniqueWords = [...newWords.entries()];
  for (let i = 0; i < uniqueWords.length; i += BATCH) {
    const chunk = uniqueWords.slice(i, i + BATCH).map(([, w]) => ({
      word: w.word,
      reading: w.reading,
      jlpt_level: "N4" as const,
      meaning_en: w.en_gloss,
      meaning_vi: null,
      frequency_rank: Number(w.frequency_rank) || null,
      han_viet: w.han_viet || null,
    }));
    const { data, error } = await sb
      .from("words")
      .insert(chunk)
      .select("id, word, reading");
    if (error) throw error;
    for (const row of data ?? []) {
      wordIdByKey.set(wordKey(row.word, row.reading), row.id);
    }
  }
  console.log(`inserted N4 words: ${newWords.size}`);

  // Existing kanji_words for the kanji set we're about to link, so we don't
  // duplicate when a word was already in DB but not yet linked to this kanji.
  const existingLinks = new Set<string>();
  let linkFrom = 0;
  for (;;) {
    const { data, error } = await sb
      .from("kanji_words")
      .select("kanji_char, word_id")
      .range(linkFrom, linkFrom + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) existingLinks.add(`${r.kanji_char} ${r.word_id}`);
    if (data.length < 1000) break;
    linkFrom += 1000;
  }

  const linkRows: Array<{ kanji_char: string; word_id: number }> = [];
  const seen = new Set<string>();
  for (const r of tsvRows) {
    const id = wordIdByKey.get(wordKey(r.word, r.reading));
    if (!id) continue;
    const dedupe = `${r.kanji_char} ${id}`;
    if (existingLinks.has(dedupe) || seen.has(dedupe)) continue;
    seen.add(dedupe);
    linkRows.push({ kanji_char: r.kanji_char, word_id: id });
  }

  for (let i = 0; i < linkRows.length; i += BATCH) {
    const chunk = linkRows.slice(i, i + BATCH);
    const { error } = await sb.from("kanji_words").insert(chunk);
    if (error) throw error;
  }
  console.log(`inserted kanji_words: ${linkRows.length}`);

  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
