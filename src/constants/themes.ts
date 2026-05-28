export const THEMES = [
  "numbers",
  "time",
  "people",
  "body",
  "nature",
  "place",
  "verbs",
  "daily_life",
] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_KANJI: Record<Theme, string[]> = {
  numbers: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万", "円", "半"],
  time: ["年", "月", "日", "時", "分", "今", "先", "後", "前", "何", "週", "毎", "午", "間"],
  people: ["人", "男", "女", "子", "父", "母", "友", "生"],
  body: ["口", "目", "耳", "手", "足"],
  nature: ["山", "川", "木", "火", "水", "土", "天", "気", "花", "雨", "魚", "空", "白"],
  place: ["上", "下", "中", "外", "東", "西", "南", "北", "右", "左", "道"],
  verbs: ["行", "来", "見", "聞", "食", "飲", "立", "出", "入", "休", "読", "言", "話", "書", "買", "会"],
  daily_life: [
    "車", "駅", "学", "校", "国", "本", "新", "古", "大", "小",
    "多", "少", "安", "高", "長", "電", "店", "社", "金", "語", "名",
  ],
};

export const KANJI_TO_THEME: Record<string, Theme> = (() => {
  const map: Record<string, Theme> = {};
  for (const theme of THEMES) {
    for (const char of THEME_KANJI[theme]) {
      map[char] = theme;
    }
  }
  return map;
})();

export const THEME_ICONS: Record<Theme, string> = {
  numbers: "🔢",
  time: "⏳",
  people: "👥",
  body: "✋",
  nature: "🌿",
  place: "🧭",
  verbs: "🏃",
  daily_life: "🏠",
};
