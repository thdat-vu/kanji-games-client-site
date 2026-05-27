"use client";

import { useEffect } from "react";
import type { KanjiWord } from "@/lib/types/kanji";

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
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${kanji} ${level}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--window-bg)] border-2 border-[var(--window-border)] rounded shadow-[var(--shadow-window)] w-full max-w-xs"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-[var(--window-titlebar-from)] to-[var(--window-titlebar-to)] px-3 py-1.5 border-b border-[var(--window-border)]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-accent)]">
              {kanji}
            </span>
            <span className="text-sm font-bold text-[var(--color-primary)]">
              {level}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-5 h-5 bg-[var(--window-close)] rounded-sm text-white text-xs font-bold flex items-center justify-center hover:brightness-110 transition"
          >
            ×
          </button>
        </div>

        <ul className="p-4 space-y-2">
          {words.map((w) => (
            <li key={w.word}>
              <button
                onClick={() => onSelectWord(w)}
                className="w-full text-left px-4 py-3 bg-white/70 rounded-lg border border-[var(--window-border)]
                  hover:bg-white hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-soft)]
                  transition text-xl font-bold text-[var(--color-primary)] tracking-wider"
              >
                {w.word}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
