import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { KanjiSelector } from "@/components/features/play/KanjiSelector";
import { listKanjiByTheme } from "@/lib/queries/kanji";
import { THEMES, type Theme } from "@/constants/themes";

export const dynamic = "force-dynamic";

function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; theme: string }>;
}) {
  const { locale, theme } = await params;
  if (!isTheme(theme)) notFound();

  const tc = await getTranslations({ locale, namespace: "common" });
  const tp = await getTranslations({ locale, namespace: "play" });
  const entries = await listKanjiByTheme(theme);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          {tc("appName")}
        </Link>
        <Link
          href="/play"
          className="text-sm text-[var(--color-primary)] no-underline hover:text-[var(--color-accent)] transition-colors"
        >
          {tp("backToLessons")}
        </Link>
      </header>

      <h2 className="text-center text-xl font-bold text-[var(--color-primary)]">
        {tp(`themes.${theme}`)}
      </h2>

      <KanjiSelector entries={entries} />
    </div>
  );
}
