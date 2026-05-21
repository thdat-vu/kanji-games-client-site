import { createClient } from "@/lib/supabase/server";
import { JLPT_LEVELS, type JLPTLevel } from "@/constants/constants";
import type {
  KanjiEntry,
  KanjiLevel,
  KanjiSummary,
  KanjiWord,
} from "@/lib/types/kanji";

interface WordRow {
  word: string;
  reading: string;
  jlpt_level: JLPTLevel;
  meaning_vi: string | null;
}

function emptyLevels(): KanjiLevel[] {
  return JLPT_LEVELS.map((level) => ({ level, coins: 0, words: [] }));
}

function toWord(row: WordRow): KanjiWord {
  return {
    word: row.word,
    reading: row.reading,
    meaning: row.meaning_vi ?? "",
  };
}

export async function listKanji(): Promise<KanjiSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji")
    .select("char")
    .order("char");
  if (error) throw error;
  return (data ?? []).map((r) => ({ kanji: r.char }));
}

export async function getKanjiWithLevels(
  char: string
): Promise<KanjiEntry | null> {
  const supabase = await createClient();
  const { data: kanjiRow, error: kanjiErr } = await supabase
    .from("kanji")
    .select("char")
    .eq("char", char)
    .maybeSingle();
  if (kanjiErr) throw kanjiErr;
  if (!kanjiRow) return null;

  const { data: linkRows, error: linkErr } = await supabase
    .from("kanji_words")
    .select("words(word, reading, jlpt_level, meaning_vi)")
    .eq("kanji_char", char);
  if (linkErr) throw linkErr;

  const levels = emptyLevels();
  const indexByLevel: Record<JLPTLevel, number> = JLPT_LEVELS.reduce(
    (acc, l, i) => {
      acc[l] = i;
      return acc;
    },
    {} as Record<JLPTLevel, number>
  );

  for (const row of linkRows ?? []) {
    // supabase-js types the joined table as object | array; normalize.
    const w = (Array.isArray(row.words) ? row.words[0] : row.words) as
      | WordRow
      | null;
    if (!w) continue;
    const idx = indexByLevel[w.jlpt_level];
    if (idx === undefined) continue;
    levels[idx].words.push(toWord(w));
  }

  return { kanji: char, levels };
}

export async function findWord(
  kanjiChar: string,
  wordStr: string
): Promise<KanjiWord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji_words")
    .select("words!inner(word, reading, jlpt_level, meaning_vi)")
    .eq("kanji_char", kanjiChar)
    .eq("words.word", wordStr)
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  const w = (Array.isArray(row.words) ? row.words[0] : row.words) as
    | WordRow
    | null;
  return w ? toWord(w) : null;
}
