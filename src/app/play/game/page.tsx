"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GameRound } from "@/components/features/play/GameRound";

function GamePage() {
  const searchParams = useSearchParams();

  const kanji = searchParams.get("kanji") ?? "";
  const word = searchParams.get("word") ?? "";
  const reading = searchParams.get("reading") ?? "";
  const meaning = searchParams.get("meaning") ?? "";

  return (
    <GameRound
      kanji={kanji}
      word={word}
      reading={reading}
      meaning={meaning}
    />
  );
}

export default function GamePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
          Đang tải...
        </div>
      }
    >
      <GamePage />
    </Suspense>
  );
}
