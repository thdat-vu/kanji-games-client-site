"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LessonError({ error, reset }: ErrorProps) {
  const t = useTranslations("play.error");
  const tp = useTranslations("play");

  useEffect(() => {
    console.error("[/play/lesson] failed to load:", error);
  }, [error]);

  return (
    <div className="min-h-screen text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/80 rounded-2xl border-2 border-[var(--color-secondary)] shadow-[var(--shadow-card)] p-8 text-center space-y-3">
        <p className="text-5xl" aria-hidden="true">🍵</p>
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="text-sm text-[var(--color-primary)]/80">{t("sub")}</p>
        <div className="flex flex-col gap-2 pt-2">
          <button onClick={reset} className="btn w-full">
            {t("retry")}
          </button>
          <Link
            href="/play"
            className="text-sm text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors no-underline"
          >
            {tp("backToLessons")}
          </Link>
        </div>
      </div>
    </div>
  );
}
