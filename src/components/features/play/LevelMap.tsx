"use client";

import { useTranslations } from "next-intl";
import type { KanjiLevel } from "@/lib/types/kanji";
import { LEVEL_COLORS } from "@/constants/constants";

interface LevelMapProps {
  kanji: string;
  levels: KanjiLevel[];
  onSelectLevel: (level: KanjiLevel) => void;
}

export function LevelMap({ kanji, levels, onSelectLevel }: LevelMapProps) {
  const tc = useTranslations("common");
  const tp = useTranslations("play");
  const ascending = [...levels].reverse();

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="bg-white/80 border-2 border-[var(--color-primary)] rounded-2xl px-6 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-[10px] text-[var(--color-primary)]/80 font-medium uppercase tracking-[0.18em]">
          {tc("kanjiBadge")}
        </p>
        <p className="text-4xl font-bold text-[var(--color-accent)] leading-tight">
          {kanji}
        </p>
      </div>

      <ol
        className="relative flex flex-col items-center gap-4 w-full max-w-sm"
        aria-label={tp("levelMap.ariaLabel")}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-3 bottom-3 -translate-x-1/2 border-l-2 border-dashed border-[var(--color-primary)]/30"
        />
        {ascending.map((lvl) => {
          const hasWords = lvl.words.length > 0;
          return (
            <li key={lvl.level} className="relative z-10 w-full max-w-[18rem]">
              <button
                onClick={() => onSelectLevel(lvl)}
                disabled={!hasWords}
                aria-label={`${lvl.level} — ${tp("levelMap.wordCount", { count: lvl.words.length })}`}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-soft)]
                  transition duration-150
                  ${
                    hasWords
                      ? "bg-white/90 border-2 border-[var(--color-secondary)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0 cursor-pointer"
                      : "bg-white/40 border-2 border-[var(--color-secondary)]/40 opacity-60 cursor-not-allowed"
                  }`}
              >
                <span
                  className={`${LEVEL_COLORS[lvl.level]} shrink-0 rounded-xl w-12 py-1 text-center text-base font-extrabold shadow-inner`}
                >
                  {lvl.level}
                </span>
                <span className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[var(--color-primary)] truncate">
                    {tp(`levelMap.label.${lvl.level}`)}
                  </span>
                  <span className="text-xs text-[var(--color-primary)]/70">
                    {hasWords
                      ? tp("levelMap.wordCount", { count: lvl.words.length })
                      : tp("levelMap.locked")}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

