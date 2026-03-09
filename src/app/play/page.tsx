"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KANJI_DATA, type KanjiEntry, type KanjiLevel } from "@/lib/data/kanji-demo";
import { LevelMap } from "@/components/features/play/LevelMap";
import { WordListModal } from "@/components/features/play/WordListModal";

export default function PlayPage() {
  const router = useRouter();
  const [selectedKanji, setSelectedKanji] = useState<KanjiEntry | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<KanjiLevel | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          Kanji<span className="text-[var(--color-secondary)]">Games</span>
        </Link>
      </header>

      {!selectedKanji ? (
        /* Step 1: Kanji selection grid */
        <section className="px-6 py-8 max-w-md mx-auto">
          <h1 className="text-2xl font-extrabold mb-6 text-center">
            Chọn chữ Kanji
          </h1>
          <div className="grid grid-cols-3 gap-4">
            {KANJI_DATA.map((entry) => (
              <button
                key={entry.kanji}
                onClick={() => setSelectedKanji(entry)}
                className="flex flex-col items-center gap-1 bg-white/70 rounded-2xl border-2 border-[var(--color-secondary)]
                  px-4 py-5 shadow hover:shadow-lg hover:border-[var(--color-primary)]
                  hover:scale-105 transition-all duration-150"
              >
                <span className="text-xs text-[var(--color-primary)]">
                  漢字
                </span>
                <span className="text-4xl font-bold text-red-800">
                  {entry.kanji}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        /* Step 2: Level map for chosen kanji */
        <section className="px-6 py-8 max-w-md mx-auto">
          <button
            onClick={() => {
              setSelectedKanji(null);
              setSelectedLevel(null);
            }}
            className="text-sm text-[var(--color-primary)] mb-4 underline underline-offset-4 bg-transparent"
          >
            ← Chọn chữ khác
          </button>

          <LevelMap
            kanji={selectedKanji.kanji}
            levels={selectedKanji.levels}
            onSelectLevel={setSelectedLevel}
          />
        </section>
      )}

      {/* Step 3: Word list modal (opens on top of level map) */}
      {selectedLevel && selectedKanji && (
        <WordListModal
          kanji={selectedKanji.kanji}
          level={selectedLevel.level}
          words={selectedLevel.words}
          onClose={() => setSelectedLevel(null)}
          onSelectWord={(word) => {
            const params = new URLSearchParams({
              kanji: selectedKanji.kanji,
              word: word.word,
              reading: word.reading,
              meaning: word.meaning,
            });
            router.push(`/play/game?${params.toString()}`);
          }}
        />
      )}
    </div>
  );
}
