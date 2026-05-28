"use server";

import { createClient } from "@/lib/supabase/server";
import {
  LESSON_COMPLETION_THRESHOLD,
  type LessonCompletion,
  type MarkWordCorrectResult,
  type UserStreak,
} from "@/lib/types/streak";
import { THEMES, type Theme } from "@/constants/themes";
import { applyDailyActivity, type StreakState } from "@/lib/streak/streak-logic";
import { localDateInTimeZone } from "@/lib/streak/dates";

function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

function rowToStreak(row: {
  current_streak: number;
  longest_streak: number;
  last_active_local_date: string | null;
  freeze_available: boolean;
  freeze_week_start: string | null;
  user_timezone: string;
}): UserStreak {
  return {
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActiveLocalDate: row.last_active_local_date,
    freezeAvailable: row.freeze_available,
    freezeWeekStart: row.freeze_week_start,
    userTimezone: row.user_timezone,
  };
}

export async function getUserStreak(): Promise<UserStreak | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("user_streaks")
    .select(
      "current_streak, longest_streak, last_active_local_date, freeze_available, freeze_week_start, user_timezone"
    )
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToStreak(data);
}

export async function getLessonCompletions(): Promise<LessonCompletion[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("lesson_completions")
    .select("theme, first_completed_at, last_completed_at, completion_count")
    .eq("user_id", auth.user.id);
  if (error) throw error;

  return (data ?? [])
    .filter((row) => isTheme(row.theme))
    .map((row) => ({
      theme: row.theme as Theme,
      firstCompletedAt: row.first_completed_at,
      lastCompletedAt: row.last_completed_at,
      completionCount: row.completion_count,
    }));
}

export async function getThemeProgress(theme: Theme): Promise<number> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;

  const { count, error } = await supabase
    .from("user_word_progress")
    .select("word", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .eq("theme", theme);
  if (error) throw error;
  return count ?? 0;
}

export async function markWordCorrect(
  theme: string,
  word: string,
  clientTimezone: string
): Promise<MarkWordCorrectResult | null> {
  if (!isTheme(theme)) return null;
  if (!word.trim()) return null;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const userId = auth.user.id;
  const tz = clientTimezone || "UTC";

  await supabase
    .from("user_word_progress")
    .upsert(
      { user_id: userId, theme, word },
      { onConflict: "user_id,theme,word", ignoreDuplicates: true }
    );

  const { count, error: countError } = await supabase
    .from("user_word_progress")
    .select("word", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("theme", theme);
  if (countError) throw countError;
  const wordsCorrect = count ?? 0;

  const result: MarkWordCorrectResult = {
    wordsCorrect,
    threshold: LESSON_COMPLETION_THRESHOLD,
    lessonJustCompleted: false,
    streakDelta: { kind: "noop" },
    currentStreak: 0,
  };

  if (wordsCorrect < LESSON_COMPLETION_THRESHOLD) {
    const streak = await getUserStreak();
    result.currentStreak = streak?.currentStreak ?? 0;
    return result;
  }

  const { data: existingCompletion } = await supabase
    .from("lesson_completions")
    .select("theme, completion_count")
    .eq("user_id", userId)
    .eq("theme", theme)
    .maybeSingle();

  result.lessonJustCompleted = !existingCompletion;

  if (existingCompletion) {
    await supabase
      .from("lesson_completions")
      .update({
        last_completed_at: new Date().toISOString(),
        completion_count: existingCompletion.completion_count + 1,
      })
      .eq("user_id", userId)
      .eq("theme", theme);
  } else {
    await supabase.from("lesson_completions").insert({
      user_id: userId,
      theme,
    });
  }

  const { data: existingStreak } = await supabase
    .from("user_streaks")
    .select(
      "current_streak, longest_streak, last_active_local_date, freeze_available, freeze_week_start, user_timezone"
    )
    .eq("user_id", userId)
    .maybeSingle();

  const todayLocal = localDateInTimeZone(new Date(), tz);
  const baseState: StreakState = existingStreak
    ? {
        currentStreak: existingStreak.current_streak,
        longestStreak: existingStreak.longest_streak,
        lastActiveLocalDate: existingStreak.last_active_local_date,
        freezeAvailable: existingStreak.freeze_available,
        freezeWeekStart: existingStreak.freeze_week_start,
      }
    : {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveLocalDate: null,
        freezeAvailable: true,
        freezeWeekStart: null,
      };

  const updated = applyDailyActivity(baseState, todayLocal);

  await supabase.from("user_streaks").upsert(
    {
      user_id: userId,
      current_streak: updated.currentStreak,
      longest_streak: updated.longestStreak,
      last_active_local_date: updated.lastActiveLocalDate,
      freeze_available: updated.freezeAvailable,
      freeze_week_start: updated.freezeWeekStart,
      user_timezone: tz,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  result.streakDelta = updated.delta;
  result.currentStreak = updated.currentStreak;
  return result;
}
