"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GameError({ error, reset }: ErrorProps) {
  const t = useTranslations("play");
  const te = useTranslations("play.error");
  const router = useRouter();

  useEffect(() => {
    console.error("[/play/game] failed to load:", error);
  }, [error]);

  return (
    <div className="min-h-screen text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/80 rounded-2xl border-2 border-[var(--color-secondary)] shadow-[var(--shadow-card)] p-8 text-center space-y-3">
        <p className="text-5xl" aria-hidden="true">🍵</p>
        <h2 className="text-xl font-bold">{te("title")}</h2>
        <p className="text-sm text-[var(--color-primary)]/80">{te("sub")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/play")}
            className="btn flex-1 bg-[var(--color-secondary)] text-[var(--color-primary)]"
          >
            {t("back")}
          </button>
          <button onClick={reset} className="btn flex-1">
            {te("retry")}
          </button>
        </div>
      </div>
    </div>
  );
}
