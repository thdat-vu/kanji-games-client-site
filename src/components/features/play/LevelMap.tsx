"use client";

import { useTranslations } from "next-intl";
import type { KanjiLevel } from "@/lib/types/kanji";
import { LEVEL_COLORS } from "@/constants/constants";

interface LevelMapProps {
  kanji: string;
  levels: KanjiLevel[];
  onSelectLevel: (level: KanjiLevel) => void;
}

const ROW_OFFSETS = [
  "ml-0",
  "ml-8 sm:ml-12",
  "ml-16 sm:ml-24",
  "ml-8 sm:ml-12",
  "ml-0",
] as const;

export function LevelMap({ kanji, levels, onSelectLevel }: LevelMapProps) {
  const tc = useTranslations("common");
  const tp = useTranslations("play");
  const ascending = [...levels].reverse(); // N1 → N5 visually top-to-bottom; reverse for N5 first

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
        className="relative flex flex-col items-start gap-3 w-full max-w-md"
        aria-label={tp("levelMap.ariaLabel")}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-3 bottom-3 -translate-x-1/2 border-l-2 border-dashed border-[var(--color-primary)]/30"
        />
        {ascending.map((lvl, i) => {
          const hasWords = lvl.words.length > 0;
          return (
            <li
              key={lvl.level}
              className={`relative ${ROW_OFFSETS[i] ?? "ml-0"} z-10`}
            >
              <button
                onClick={() => onSelectLevel(lvl)}
                disabled={!hasWords}
                aria-label={`${lvl.level} — ${tp("levelMap.wordCount", { count: lvl.words.length })}`}
                className={`flex items-center gap-3 rounded-2xl px-5 py-3 shadow-[var(--shadow-soft)]
                  transition duration-150
                  ${
                    hasWords
                      ? "bg-white/90 border-2 border-[var(--color-secondary)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0 cursor-pointer"
                      : "bg-white/40 border-2 border-[var(--color-secondary)]/40 opacity-60 cursor-not-allowed"
                  }`}
              >
                <span
                  className={`${LEVEL_COLORS[lvl.level]} rounded-xl px-3 py-1 text-base font-extrabold shadow-inner`}
                >
                  {lvl.level}
                </span>
                <span className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-[var(--color-primary)]">
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
