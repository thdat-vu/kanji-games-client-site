import { getTranslations } from "next-intl/server";
import { findWord, getKanjiReadings } from "@/lib/queries/kanji";
import { GameRound } from "@/components/features/play/GameRound";
import { KANJI_TO_THEME } from "@/constants/themes";

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
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text)]">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  const [wordData, readings] = await Promise.all([
    findWord(kanji, wordParam),
    getKanjiReadings(kanji),
  ]);

  if (!wordData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text)]">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  return (
    <GameRound
      kanji={kanji}
      word={wordData.word}
      reading={wordData.reading}
      meaning={locale === "en" ? wordData.meaningEn || wordData.meaningVi : wordData.meaningVi || wordData.meaningEn}
      theme={KANJI_TO_THEME[kanji] ?? null}
      onReadings={readings?.on ?? []}
      kunReadings={readings?.kun ?? []}
    />
  );
}
