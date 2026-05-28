"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/auth-context";
import { getUserStreak } from "@/lib/queries/streak";
import { localDateInTimeZone } from "@/lib/streak/dates";

export function HomeStreakStrip() {
  const { user, loading } = useAuth();
  const t = useTranslations("play.streak");
  const tHome = useTranslations("home");
  const [streak, setStreak] = useState<number | null>(null);
  const [activeToday, setActiveToday] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    getUserStreak()
      .then((s) => {
        if (cancelled || !s || s.currentStreak <= 0) return;
        const tz =
          Intl.DateTimeFormat().resolvedOptions().timeZone || s.userTimezone;
        const today = localDateInTimeZone(new Date(), tz);
        setStreak(s.currentStreak);
        setActiveToday(s.lastActiveLocalDate === today);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (!user || streak === null) return null;

  return (
    <div className="px-6 pt-2 md:px-12 md:max-w-5xl md:mx-auto md:w-full">
      <div className="bg-white/70 border-2 border-[var(--color-secondary)] rounded-2xl px-4 py-2 flex items-center gap-3 shadow-[var(--shadow-soft)]">
        <span className="text-2xl" aria-hidden="true">
          🔥
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-primary)]">
            {t("label", { count: streak })}
          </p>
          <p className="text-xs text-[var(--color-primary)]/70 truncate">
            {activeToday ? tHome("streakKeptToday") : tHome("streakComeBack")}
          </p>
        </div>
      </div>
    </div>
  );
}
