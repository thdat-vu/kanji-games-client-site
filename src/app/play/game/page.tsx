import { findWord } from "@/lib/queries/kanji";
import { LABELS } from "@/constants/constants";
import { GameRound } from "@/components/features/play/GameRound";

interface PageProps {
  searchParams: Promise<{ kanji?: string; word?: string }>;
}

export const dynamic = "force-dynamic";

export default async function GamePage({ searchParams }: PageProps) {
  const { kanji = "", word: wordParam = "" } = await searchParams;

  if (!kanji || !wordParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p>{LABELS.NOT_FOUND}</p>
      </div>
    );
  }

  const wordData = await findWord(kanji, wordParam);

  if (!wordData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p>{LABELS.NOT_FOUND}</p>
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
