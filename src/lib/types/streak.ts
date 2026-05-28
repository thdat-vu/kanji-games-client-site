import type { Theme } from "@/constants/themes";

export const LESSON_COMPLETION_THRESHOLD = 5;

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveLocalDate: string | null;
  freezeAvailable: boolean;
  freezeWeekStart: string | null;
  userTimezone: string;
}

export interface LessonCompletion {
  theme: Theme;
  firstCompletedAt: string;
  lastCompletedAt: string;
  completionCount: number;
}

export interface ThemeProgress {
  theme: Theme;
  wordsCorrect: number;
  threshold: number;
  completed: boolean;
}

export type StreakDelta =
  | { kind: "noop" }
  | { kind: "increment"; value: number }
  | { kind: "freeze_used"; value: number }
  | { kind: "reset"; value: 1 };

export interface MarkWordCorrectResult {
  wordsCorrect: number;
  threshold: number;
  lessonJustCompleted: boolean;
  streakDelta: StreakDelta;
  currentStreak: number;
}
