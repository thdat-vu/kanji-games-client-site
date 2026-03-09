"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { findWord } from "@/lib/data/kanji-demo";
import { LABELS } from "@/constants/constants";
import { GameRound } from "@/components/features/play/GameRound";

function GamePage() {
  const searchParams = useSearchParams();

  const kanji = searchParams.get("kanji") ?? "";
  const wordParam = searchParams.get("word") ?? "";

  const wordData = findWord(kanji, wordParam);

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

export default function GamePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
          {LABELS.LOADING}
        </div>
      }
    >
      <GamePage />
    </Suspense>
  );
}
