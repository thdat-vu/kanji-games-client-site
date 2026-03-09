"use client";

import type { KanjiWord } from "@/lib/data/kanji-demo";

interface WordListModalProps {
  kanji: string;
  level: string;
  words: KanjiWord[];
  onSelectWord: (word: KanjiWord) => void;
  onClose: () => void;
}

export function WordListModal({
  kanji,
  level,
  words,
  onSelectWord,
  onClose,
}: WordListModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#e8ddd4] border-2 border-[#b8a89a] rounded shadow-xl w-full max-w-xs">
        {/* Title bar – retro window style */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#c4b5a7] to-[#d6cbbf] px-3 py-1.5 border-b border-[#b8a89a]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-800">{kanji}</span>
            <span className="text-sm font-bold text-[var(--color-primary)]">
              {level}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onClose}
              className="w-5 h-5 bg-[#c0392b] rounded-sm text-white text-xs font-bold flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              X
            </button>
          </div>
        </div>

        {/* Word list */}
        <div className="p-4 space-y-2">
          {words.map((w) => (
            <button
              key={w.word}
              onClick={() => onSelectWord(w)}
              className="w-full text-left px-4 py-3 bg-white/60 rounded-lg border border-[#c4b5a7]
                hover:bg-white hover:border-red-400 hover:shadow transition-all
                text-xl font-bold text-[var(--color-primary)] tracking-wider"
            >
              {w.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
