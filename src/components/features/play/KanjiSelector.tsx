"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type {
  KanjiEntry,
  KanjiLevel,
  KanjiWord,
} from "@/lib/types/kanji";
import { LevelMap } from "./LevelMap";
import { WordListModal } from "./WordListModal";

interface KanjiSelectorProps {
  entries: KanjiEntry[];
}

export function KanjiSelector({ entries }: KanjiSelectorProps) {
  const router = useRouter();
  const t = useTranslations("play");
  const tc = useTranslations("common");
  const [selectedKanji, setSelectedKanji] = useState<KanjiEntry | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<KanjiLevel | null>(null);

  function handleSelectWord(word: KanjiWord) {
    if (!selectedKanji) return;
    const params = new URLSearchParams({
      kanji: selectedKanji.kanji,
      word: word.word,
    });
    router.push(`/play/game?${params.toString()}`);
  }

  function handleBack() {
    setSelectedKanji(null);
    setSelectedLevel(null);
  }

  if (!selectedKanji) {
    return (
      <section className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold mb-6 text-center">
          {t("selectKanji")}
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {entries.map((entry) => (
            <button
              key={entry.kanji}
              onClick={() => setSelectedKanji(entry)}
              className="flex flex-col items-center gap-1 bg-white/70 rounded-2xl border-2 border-[var(--color-secondary)]
                px-4 py-5 shadow hover:shadow-lg hover:border-[var(--color-primary)]
                hover:scale-105 transition-all duration-150"
            >
              <span className="text-xs text-[var(--color-primary)]">{tc("kanjiBadge")}</span>
              <span className="text-4xl font-bold text-red-800">
                {entry.kanji}
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="px-6 py-8 max-w-md mx-auto">
        <button
          onClick={handleBack}
          className="text-sm text-[var(--color-primary)] mb-4 underline underline-offset-4 bg-transparent"
        >
          {t("selectOther")}
        </button>

        <LevelMap
          kanji={selectedKanji.kanji}
          levels={selectedKanji.levels}
          onSelectLevel={setSelectedLevel}
        />
      </section>

      {selectedLevel && (
        <WordListModal
          kanji={selectedKanji.kanji}
          level={selectedLevel.level}
          words={selectedLevel.words}
          onClose={() => setSelectedLevel(null)}
          onSelectWord={handleSelectWord}
        />
      )}
    </>
  );
}
