import { useTranslations } from "next-intl";

interface StreakBadgeProps {
  streak: number | null;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const t = useTranslations("play.streak");
  if (streak === null || streak <= 0) return null;
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border-2 border-[var(--color-primary)]/30 px-3 py-1 shadow-[var(--shadow-soft)]"
      aria-label={t("ariaLabel", { count: streak })}
    >
      <span className="text-base" aria-hidden="true">🔥</span>
      <span className="text-sm font-bold tabular-nums text-[var(--color-primary)]">
        {t("label", { count: streak })}
      </span>
    </div>
  );
}
