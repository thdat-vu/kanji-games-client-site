import { TIMER_SECONDS } from "@/constants/constants";

export const STAR_THRESHOLDS = {
  three: 20,
  two: 10,
} as const;

export type Stars = 0 | 1 | 2 | 3;

export function gradeStars(timeLeftSeconds: number, correct: boolean): Stars {
  if (!correct) return 0;
  const clamped = Math.max(0, Math.min(TIMER_SECONDS, Math.floor(timeLeftSeconds)));
  if (clamped >= STAR_THRESHOLDS.three) return 3;
  if (clamped >= STAR_THRESHOLDS.two) return 2;
  return 1;
}
