import { getTranslations } from "next-intl/server";

export default async function GameLoading() {
  const t = await getTranslations("play");
  return (
    <div className="min-h-screen text-[var(--color-text)] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-12 w-16 rounded-xl bg-[var(--color-secondary)]/70 animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)]/70 animate-pulse" />
      </header>
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">{t("loadingWord")}</p>
        <div className="w-full max-w-xs h-32 rounded-2xl border-2 border-[var(--color-secondary)] bg-white/40 animate-pulse" />
        <div className="w-full max-w-xs h-2 bg-[var(--color-secondary)]/70 rounded-full animate-pulse" />
        <div className="w-full max-w-xs h-12 rounded-xl bg-[var(--color-secondary)]/70 animate-pulse" />
      </main>
    </div>
  );
}
