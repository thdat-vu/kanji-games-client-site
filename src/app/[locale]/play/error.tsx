"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlayError({ error, reset }: ErrorProps) {
  const t = useTranslations("play.error");

  useEffect(() => {
    console.error("[/play] failed to load:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/80 rounded-2xl border-2 border-[var(--color-secondary)] shadow-[var(--shadow-card)] p-8 text-center space-y-3">
        <p className="text-5xl" aria-hidden="true">🍵</p>
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="text-sm text-[var(--color-primary)]/80">{t("sub")}</p>
        <button onClick={reset} className="btn w-full">
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
