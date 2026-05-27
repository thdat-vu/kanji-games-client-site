import { getTranslations } from "next-intl/server";

export default async function PlayLoading() {
  const t = await getTranslations("play");
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="h-6 w-24 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
      </header>
      <section
        className="px-6 py-8 max-w-md mx-auto"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">{t("loadingKanji")}</p>
        <div className="mx-auto mb-6 h-7 w-40 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
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
