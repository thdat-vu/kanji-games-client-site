"use client";

import type { KanjiLevel } from "@/lib/data/kanji-demo";
import { LEVEL_COLORS, LEVEL_POSITIONS } from "@/constants/constants";

interface LevelMapProps {
  kanji: string;
  levels: KanjiLevel[];
  onSelectLevel: (level: KanjiLevel) => void;
}

export function LevelMap({ kanji, levels, onSelectLevel }: LevelMapProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#F5EEE6] border-2 border-[var(--color-primary)] rounded-xl px-4 py-2 shadow">
          <p className="text-xs text-[var(--color-primary)] font-medium">
            漢字
          </p>
          <p className="text-4xl font-bold text-red-800">{kanji}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full max-w-sm mx-auto py-4">
        {levels.map((lvl, i) => (
          <button
            key={lvl.level}
            onClick={() => onSelectLevel(lvl)}
            className={`${LEVEL_POSITIONS[i]} flex flex-col items-center gap-1 group`}
          >
            {lvl.coins > 0 && (
              <span className="bg-white/90 rounded-lg px-2 py-0.5 text-sm font-bold text-amber-700 shadow-sm">
                {lvl.coins} 🪙
              </span>
            )}
            <span
              className={`${LEVEL_COLORS[lvl.level]} rounded-lg px-5 py-2 text-lg font-extrabold shadow-md
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-150`}
            >
              {lvl.level}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
