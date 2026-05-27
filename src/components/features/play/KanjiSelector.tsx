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
    if (entries.length === 0) {
      return (
        <section
          className="px-6 py-12 max-w-md mx-auto text-center space-y-3"
          aria-live="polite"
        >
          <p className="text-5xl" aria-hidden="true">🎴</p>
          <h1 className="text-xl font-bold">{t("empty.title")}</h1>
          <p className="text-sm text-[var(--color-primary)]/80">
            {t("empty.sub")}
          </p>
        </section>
      );
    }
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
              className="flex flex-col items-center gap-1 bg-white/80 rounded-2xl border-2 border-[var(--color-secondary)]
                px-4 py-5 shadow-[var(--shadow-soft)]
                hover:shadow-[var(--shadow-card)] hover:border-[var(--color-primary)] hover:-translate-y-0.5
                active:translate-y-0
                transition duration-150"
            >
              <span className="text-xs text-[var(--color-primary)]/80">
                {tc("kanjiBadge")}
              </span>
              <span className="text-4xl font-bold text-[var(--color-accent)]">
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
          className="text-sm text-[var(--color-primary)] mb-4 underline underline-offset-4 bg-transparent hover:text-[var(--color-accent)] transition-colors"
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
