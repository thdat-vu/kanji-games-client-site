import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { KanjiSelector } from "@/components/features/play/KanjiSelector";
import { listKanjiWithLevels } from "@/lib/queries/kanji";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tc = await getTranslations({ locale, namespace: "common" });

  const entries = await listKanjiWithLevels();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          {tc("appName")}
        </Link>
      </header>

      <KanjiSelector entries={entries} />
    </div>
  );
}
