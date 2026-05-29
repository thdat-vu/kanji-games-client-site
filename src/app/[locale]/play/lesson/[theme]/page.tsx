import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { KanjiSelector } from "@/components/features/play/KanjiSelector";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { BrandTypewriter } from "@/components/BrandTypewriter";
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

  const tp = await getTranslations({ locale, namespace: "play" });
  const entries = await listKanjiByTheme(theme);

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          <BrandTypewriter />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/play"
            className="text-sm text-[var(--color-primary)] no-underline hover:text-[var(--color-accent)] transition-colors"
          >
            {tp("backToLessons")}
          </Link>
        </div>
      </header>

      <h2 className="text-center text-xl md:text-2xl font-bold text-[var(--color-primary)]">
        {tp(`themes.${theme}`)}
      </h2>

      <KanjiSelector entries={entries} />
    </div>
  );
}
