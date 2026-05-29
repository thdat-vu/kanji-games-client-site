export const TIMER_SECONDS = 30;

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const LEVEL_COLORS: Record<JLPTLevel, string> = {
  N5: "bg-amber-700 text-white",
  N4: "bg-amber-600 text-white",
  N3: "bg-amber-500 text-white",
  N2: "bg-stone-600 text-white",
  N1: "bg-stone-800 text-white",
};
