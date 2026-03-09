import type { JLPTLevel } from "@/constants/constants";

export interface KanjiWord {
  word: string;
  reading: string;
  meaning: string;
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

export function findWord(
  kanjiChar: string,
  wordStr: string
): KanjiWord | null {
  const entry = KANJI_DATA.find((e) => e.kanji === kanjiChar);
  if (!entry) return null;
  for (const level of entry.levels) {
    const found = level.words.find((w) => w.word === wordStr);
    if (found) return found;
  }
  return null;
}

export const KANJI_DATA: KanjiEntry[] = [
  {
    kanji: "事",
    levels: [
      {
        level: "N5",
        coins: 1,
        words: [
          { word: "事", reading: "こと", meaning: "việc, chuyện" },
          { word: "食事", reading: "しょくじ", meaning: "bữa ăn" },
          { word: "仕事", reading: "しごと", meaning: "công việc" },
        ],
      },
      {
        level: "N4",
        coins: 7,
        words: [
          { word: "火事", reading: "かじ", meaning: "hoả hoạn" },
          { word: "事故", reading: "じこ", meaning: "tai nạn" },
          { word: "大事", reading: "だいじ", meaning: "quan trọng" },
          { word: "返事", reading: "へんじ", meaning: "trả lời" },
        ],
      },
      {
        level: "N3",
        coins: 10,
        words: [
          { word: "事件", reading: "じけん", meaning: "sự kiện, vụ việc" },
          { word: "事実", reading: "じじつ", meaning: "sự thật" },
          { word: "事情", reading: "じじょう", meaning: "tình hình, hoàn cảnh" },
          { word: "記事", reading: "きじ", meaning: "bài báo" },
          { word: "知事", reading: "ちじ", meaning: "thống đốc" },
        ],
      },
      {
        level: "N2",
        coins: 0,
        words: [
          { word: "行事", reading: "ぎょうじ", meaning: "sự kiện, lễ hội" },
          { word: "炊事", reading: "すいじ", meaning: "nấu nướng" },
          { word: "工事", reading: "こうじ", meaning: "công trình" },
        ],
      },
      {
        level: "N1",
        coins: 0,
        words: [
          { word: "事態", reading: "じたい", meaning: "tình thế" },
          { word: "事項", reading: "じこう", meaning: "hạng mục" },
          { word: "事業", reading: "じぎょう", meaning: "sự nghiệp, doanh nghiệp" },
        ],
      },
    ],
  },
  {
    kanji: "日",
    levels: [
      {
        level: "N5",
        coins: 3,
        words: [
          { word: "日", reading: "ひ / にち", meaning: "ngày, mặt trời" },
          { word: "今日", reading: "きょう", meaning: "hôm nay" },
          { word: "毎日", reading: "まいにち", meaning: "mỗi ngày" },
        ],
      },
      {
        level: "N4",
        coins: 5,
        words: [
          { word: "日記", reading: "にっき", meaning: "nhật ký" },
          { word: "休日", reading: "きゅうじつ", meaning: "ngày nghỉ" },
          { word: "日曜日", reading: "にちようび", meaning: "chủ nhật" },
        ],
      },
      {
        level: "N3",
        coins: 0,
        words: [
          { word: "日常", reading: "にちじょう", meaning: "thường ngày" },
          { word: "日程", reading: "にってい", meaning: "lịch trình" },
        ],
      },
      {
        level: "N2",
        coins: 0,
        words: [
          { word: "日課", reading: "にっか", meaning: "công việc hàng ngày" },
          { word: "日誌", reading: "にっし", meaning: "nhật chí" },
        ],
      },
      {
        level: "N1",
        coins: 0,
        words: [
          { word: "日没", reading: "にちぼつ", meaning: "hoàng hôn" },
          { word: "日照", reading: "にっしょう", meaning: "ánh nắng" },
        ],
      },
    ],
  },
];
