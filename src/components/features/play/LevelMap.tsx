"use client";

import { useTranslations } from "next-intl";
import type { KanjiLevel } from "@/lib/types/kanji";
import { LEVEL_COLORS, LEVEL_POSITIONS } from "@/constants/constants";

interface LevelMapProps {
  kanji: string;
  levels: KanjiLevel[];
  onSelectLevel: (level: KanjiLevel) => void;
}

export function LevelMap({ kanji, levels, onSelectLevel }: LevelMapProps) {
  const tc = useTranslations("common");
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white/70 border-2 border-[var(--color-primary)] rounded-2xl px-5 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-xs text-[var(--color-primary)]/80 font-medium tracking-wide">
          {tc("kanjiBadge")}
        </p>
        <p className="text-4xl font-bold text-[var(--color-accent)] leading-tight">
          {kanji}
        </p>
      </div>

      <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full max-w-sm mx-auto py-4">
        {levels.map((lvl, i) => (
          <button
            key={lvl.level}
            onClick={() => onSelectLevel(lvl)}
            aria-label={`${lvl.level} — ${lvl.coins} coins`}
            className={`${LEVEL_POSITIONS[i]} flex flex-col items-center gap-1 group bg-transparent`}
          >
            {lvl.coins > 0 && (
              <span className="bg-white/90 rounded-lg px-2 py-0.5 text-sm font-bold text-amber-700 shadow-[var(--shadow-soft)]">
                {lvl.coins} 🪙
              </span>
            )}
            <span
              className={`${LEVEL_COLORS[lvl.level]} rounded-lg px-5 py-2 text-lg font-extrabold shadow-[var(--shadow-soft)]
                group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card)]
                group-active:translate-y-0
                transition duration-150`}
            >
              {lvl.level}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
