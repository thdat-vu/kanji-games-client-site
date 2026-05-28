import type { StreakDelta } from "@/lib/types/streak";
import { daysBetween, mondayOf } from "./dates";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveLocalDate: string | null;
  freezeAvailable: boolean;
  freezeWeekStart: string | null;
}

export interface StreakUpdate extends StreakState {
  delta: StreakDelta;
}

export function applyDailyActivity(
  state: StreakState,
  todayLocal: string
): StreakUpdate {
  const todayWeek = mondayOf(todayLocal);
  let freezeAvailable = state.freezeAvailable;
  let freezeWeekStart = state.freezeWeekStart;
  if (freezeWeekStart !== todayWeek) {
    freezeAvailable = true;
    freezeWeekStart = todayWeek;
  }

  if (state.lastActiveLocalDate === null) {
    const next = 1;
    return {
      currentStreak: next,
      longestStreak: Math.max(state.longestStreak, next),
      lastActiveLocalDate: todayLocal,
      freezeAvailable,
      freezeWeekStart,
      delta: { kind: "increment", value: next },
    };
  }

  const gap = daysBetween(state.lastActiveLocalDate, todayLocal);

  if (gap <= 0) {
    return {
      ...state,
      freezeAvailable,
      freezeWeekStart,
      delta: { kind: "noop" },
    };
  }

  if (gap === 1) {
    const next = state.currentStreak + 1;
    return {
      currentStreak: next,
      longestStreak: Math.max(state.longestStreak, next),
      lastActiveLocalDate: todayLocal,
      freezeAvailable,
      freezeWeekStart,
      delta: { kind: "increment", value: next },
    };
  }

  if (gap === 2 && freezeAvailable) {
    const next = state.currentStreak + 1;
    return {
      currentStreak: next,
      longestStreak: Math.max(state.longestStreak, next),
      lastActiveLocalDate: todayLocal,
      freezeAvailable: false,
      freezeWeekStart,
      delta: { kind: "freeze_used", value: next },
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(state.longestStreak, 1),
    lastActiveLocalDate: todayLocal,
    freezeAvailable,
    freezeWeekStart,
    delta: { kind: "reset", value: 1 },
  };
}
