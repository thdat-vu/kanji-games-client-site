import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { THEME_ICONS, type Theme } from "@/constants/themes";
import type { LessonSummary } from "@/lib/queries/kanji";

interface LessonSelectorProps {
  lessons: LessonSummary[];
  completedThemes?: ReadonlySet<Theme>;
}

export async function LessonSelector({
  lessons,
  completedThemes,
}: LessonSelectorProps) {
  const t = await getTranslations("play");
  const tStreak = await getTranslations("play.streak");
  return (
    <section className="px-6 py-8 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-1 text-center">
        {t("selectLesson")}
      </h1>
      <p className="text-sm md:text-base text-center text-[var(--color-primary)]/80 mb-6 md:mb-8">
        {t("lessonsHint")}
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {lessons.map((l) => {
          const completed = completedThemes?.has(l.theme) ?? false;
          return (
            <li key={l.theme}>
              <Link
                href={`/play/lesson/${l.theme}`}
                className={`relative flex h-full flex-col items-center gap-1 bg-white/80 rounded-2xl border-2 px-4 py-5 shadow-[var(--shadow-soft)] no-underline
                hover:shadow-[var(--shadow-card)] hover:border-[var(--color-primary)] hover:-translate-y-0.5
                active:translate-y-0
                transition duration-150 ${completed ? "border-green-400" : "border-[var(--color-secondary)]"}`}
              >
                {completed && (
                  <span
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold shadow"
                    aria-label={tStreak("stampLabel")}
                  >
                    ✓
                  </span>
                )}
                <span className="text-3xl" aria-hidden="true">
                  {THEME_ICONS[l.theme]}
                </span>
                <span className="text-base font-bold text-[var(--color-primary)] text-center">
                  {t(`themes.${l.theme}`)}
                </span>
                <span className="text-xs text-[var(--color-primary)]/70">
                  {t("kanjiCount", { count: l.kanjiCount })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
