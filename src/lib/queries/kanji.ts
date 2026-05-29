import { createClient } from "@/lib/supabase/server";
import { JLPT_LEVELS, type JLPTLevel } from "@/constants/constants";
import { KANJI_TO_THEME, THEMES, type Theme } from "@/constants/themes";
import type {
  KanjiEntry,
  KanjiLevel,
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

export async function listKanjiWithLevels(): Promise<KanjiEntry[]> {
  const supabase = await createClient();
  const [kanjiRes, linksRes] = await Promise.all([
    supabase.from("kanji").select("char").order("char"),
    supabase
      .from("kanji_words")
      .select("kanji_char, words(word, reading, jlpt_level, meaning_vi)"),
  ]);
  if (kanjiRes.error) throw kanjiRes.error;
  if (linksRes.error) throw linksRes.error;

  const indexByLevel: Record<JLPTLevel, number> = JLPT_LEVELS.reduce(
    (acc, l, i) => {
      acc[l] = i;
      return acc;
    },
    {} as Record<JLPTLevel, number>
  );

  const entries = new Map<string, KanjiEntry>();
  for (const k of kanjiRes.data ?? []) {
    entries.set(k.char, { kanji: k.char, levels: emptyLevels() });
  }

  for (const row of linksRes.data ?? []) {
    const entry = entries.get(row.kanji_char);
    if (!entry) continue;
    const w = (Array.isArray(row.words) ? row.words[0] : row.words) as
      | WordRow
      | null;
    if (!w) continue;
    const idx = indexByLevel[w.jlpt_level];
    if (idx === undefined) continue;
    entry.levels[idx].words.push(toWord(w));
  }

  return [...entries.values()];
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

export interface KanjiReadings {
  on: string[];
  kun: string[];
}

export async function getKanjiReadings(
  kanjiChar: string
): Promise<KanjiReadings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji")
    .select("on_readings, kun_readings")
    .eq("char", kanjiChar)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    on: data.on_readings ?? [],
    kun: data.kun_readings ?? [],
  };
}

export interface LessonSummary {
  theme: Theme;
  kanjiCount: number;
}

export async function listThemes(): Promise<LessonSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("kanji").select("char");
  if (error) throw error;

  const counts: Record<Theme, number> = THEMES.reduce(
    (acc, t) => {
      acc[t] = 0;
      return acc;
    },
    {} as Record<Theme, number>
  );

  for (const row of data ?? []) {
    const theme = KANJI_TO_THEME[row.char];
    if (theme) counts[theme] += 1;
  }

  return THEMES.map((theme) => ({ theme, kanjiCount: counts[theme] }));
}

export async function listKanjiByTheme(theme: Theme): Promise<KanjiEntry[]> {
  const all = await listKanjiWithLevels();
  return all.filter((entry) => KANJI_TO_THEME[entry.kanji] === theme);
}
