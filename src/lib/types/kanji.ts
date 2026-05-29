import type { JLPTLevel } from "@/constants/constants";

export interface KanjiWord {
  word: string;
  reading: string;
  meaning: string;
  meaningVi: string;
  meaningEn: string;
}

export interface KanjiLevel {
  level: JLPTLevel;
  coins: number;
  words: KanjiWord[];
}

export interface KanjiEntry {
  kanji: string;
  levels: KanjiLevel[];
}

export interface KanjiSummary {
  kanji: string;
}
