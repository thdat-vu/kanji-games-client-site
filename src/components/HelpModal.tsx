"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  titleKey: "play" | "lesson" | "game";
}

export function HelpModal({ open, onClose, titleKey }: HelpModalProps) {
  const th = useTranslations("help");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  const stepCount = { play: 3, lesson: 3, game: 4 }[titleKey];
  const stepKeys = Array.from({ length: stepCount }, (_, i) => `s${i + 1}`);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-[var(--window-bg)] border-2 border-[var(--window-border)] shadow-[6px_6px_0_rgba(0,0,0,0.25)] flex flex-col"
        style={{
          borderTopColor: "#FFFFFF",
          borderLeftColor: "#FFFFFF",
        }}
      >
        <div
          className="flex items-center justify-between px-2 py-1 text-white font-bold text-sm"
          style={{
            background:
              "linear-gradient(to right, var(--window-titlebar-from), var(--window-titlebar-to))",
          }}
        >
          <span id="help-modal-title" className="truncate">
            {th(`${titleKey}.title`)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={th("close")}
            className="w-6 h-6 flex items-center justify-center bg-[var(--window-close)] text-white text-xs font-bold shadow-[1px_1px_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-[1px] cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3 text-[var(--color-text)]">
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            {th(`${titleKey}.lead`)}
          </p>
          <ol className="flex flex-col gap-2 list-decimal pl-5 text-sm text-[var(--color-primary)]/90">
            {stepKeys.map((k) => (
              <li key={k}>{th(`${titleKey}.${k}`)}</li>
            ))}
          </ol>
          <p className="text-xs text-[var(--color-primary)]/70 pt-1">
            {th(`${titleKey}.tip`)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="self-end mt-2 px-4 py-1 bg-[var(--color-secondary)] border-2 border-[var(--window-border)] text-sm font-semibold text-[var(--color-primary)] shadow-[2px_2px_0_rgba(0,0,0,0.2)] hover:brightness-105 active:translate-y-[1px] cursor-pointer"
            style={{
              borderTopColor: "#FFFFFF",
              borderLeftColor: "#FFFFFF",
            }}
          >
            {th("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
