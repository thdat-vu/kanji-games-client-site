import { getTranslations } from "next-intl/server";

export default async function LessonLoading() {
  const t = await getTranslations("play");
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6 max-w-5xl mx-auto w-full">
        <span className="h-6 w-24 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
        <span className="h-4 w-16 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
      </header>
      <section
        className="px-6 py-8 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">{t("loadingKanji")}</p>
        <div className="mx-auto mb-6 h-7 w-48 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border-2 border-[var(--color-secondary)] bg-white/40 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
