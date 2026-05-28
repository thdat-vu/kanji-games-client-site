import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LessonSelector } from "@/components/features/play/LessonSelector";
import { StreakBadge } from "@/components/features/streak/StreakBadge";
import { UserMenu } from "@/components/features/auth/UserMenu";
import { listThemes } from "@/lib/queries/kanji";
import { getLessonCompletions, getUserStreak } from "@/lib/queries/streak";
import type { Theme } from "@/constants/themes";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tc = await getTranslations({ locale, namespace: "common" });

  const [lessons, streak, completions] = await Promise.all([
    listThemes(),
    getUserStreak(),
    getLessonCompletions(),
  ]);

  const completedThemes: ReadonlySet<Theme> = new Set(
    completions.map((c) => c.theme)
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          {tc("appName")}
        </Link>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak?.currentStreak ?? null} />
          <UserMenu />
        </div>
      </header>

      <LessonSelector lessons={lessons} completedThemes={completedThemes} />
    </div>
  );
}
