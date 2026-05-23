import { getTranslations } from "next-intl/server";
import { findWord } from "@/lib/queries/kanji";
import { GameRound } from "@/components/features/play/GameRound";

interface PageProps {
  searchParams: Promise<{ kanji?: string; word?: string }>;
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export default async function GamePage({ searchParams, params }: PageProps) {
  const { kanji = "", word: wordParam = "" } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "play" });

  if (!kanji || !wordParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  const wordData = await findWord(kanji, wordParam);

  if (!wordData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  return (
    <GameRound
      kanji={kanji}
      word={wordData.word}
      reading={wordData.reading}
      meaning={wordData.meaning}
    />
  );
}
