import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { THEME_ICONS } from "@/constants/themes";
import type { LessonSummary } from "@/lib/queries/kanji";

interface LessonSelectorProps {
  lessons: LessonSummary[];
}

export async function LessonSelector({ lessons }: LessonSelectorProps) {
  const t = await getTranslations("play");
  return (
    <section className="px-6 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold mb-1 text-center">
        {t("selectLesson")}
      </h1>
      <p className="text-sm text-center text-[var(--color-primary)]/80 mb-6">
        {t("lessonsHint")}
      </p>
      <ul className="grid grid-cols-2 gap-4">
        {lessons.map((l) => (
          <li key={l.theme}>
            <Link
              href={`/play/lesson/${l.theme}`}
              className="flex h-full flex-col items-center gap-1 bg-white/80 rounded-2xl border-2 border-[var(--color-secondary)]
                px-4 py-5 shadow-[var(--shadow-soft)] no-underline
                hover:shadow-[var(--shadow-card)] hover:border-[var(--color-primary)] hover:-translate-y-0.5
                active:translate-y-0
                transition duration-150"
            >
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
        ))}
      </ul>
    </section>
  );
}
