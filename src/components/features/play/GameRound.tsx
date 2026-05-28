"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useGameTimer } from "@/hooks/useGameTimer";

interface GameRoundProps {
  kanji: string;
  word: string;
  reading: string;
  meaning: string;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function GameRound({ kanji, word, reading, meaning }: GameRoundProps) {
  const router = useRouter();
  const t = useTranslations("play");
  const tc = useTranslations("common");
  const { timeLeft, percent, expired, stop, reset } = useGameTimer();

  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const handleReveal = useCallback(() => {
    stop();
    setRevealed(true);
  }, [stop]);

  const handleReset = useCallback(() => {
    setRevealed(false);
    setUserAnswer("");
    reset();
  }, [reset]);

  if (!revealed && expired) {
    setRevealed(true);
  }

  const isCorrect =
    revealed &&
    userAnswer.trim() !== "" &&
    normalize(meaning)
      .split(",")
      .some((part) => normalize(userAnswer) === normalize(part));

  const isTimedOut = revealed && expired && userAnswer.trim() === "";
  const isWrong = revealed && !isCorrect && !isTimedOut;

  const resultTitle = isCorrect
    ? t("result.correctTitle")
    : isTimedOut
      ? t("result.timeoutTitle")
      : t("result.wrongTitle");

  const resultSub = isCorrect
    ? t("result.correctSub")
    : isTimedOut
      ? t("result.timeoutSub")
      : t("result.wrongSub");

  const resultColor = isCorrect ? "green" : isTimedOut ? "amber" : "red";

  const bannerStyles = {
    green: "bg-green-100 border-2 border-green-400",
    amber: "bg-amber-100 border-2 border-amber-400",
    red: "bg-red-100 border-2 border-red-400",
  }[resultColor];

  const bannerAnimation = isCorrect
    ? "animate-[successPulse_0.5s_ease-out]"
    : "animate-[shake_0.4s_ease-out]";

  const titleColor = {
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }[resultColor];

  const subColor = {
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[resultColor];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="bg-white/70 border-2 border-[var(--color-primary)] rounded-xl px-3 py-1 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] text-[var(--color-primary)]/80">
            {tc("kanjiBadge")}
          </p>
          <p className="text-2xl font-bold text-[var(--color-accent)] leading-tight">
            {kanji}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          aria-label={t("back")}
          className="w-8 h-8 rounded-full bg-[var(--window-close)] text-white font-bold text-sm flex items-center justify-center
            hover:brightness-110 transition shadow-[var(--shadow-soft)]"
        >
          ×
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="bg-white/70 border-2 border-[var(--color-secondary)] rounded-2xl shadow-[var(--shadow-card)] px-8 py-6 w-full max-w-xs text-center space-y-2">
          <p className="text-lg text-[var(--color-primary)]/80">{reading}</p>
          <p className="text-4xl font-extrabold text-[var(--color-primary)]">
            {word}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">⏳</span>
            <span className="text-lg font-bold tabular-nums">{timeLeft}s</span>
          </div>
          <div
            className="w-full h-2 bg-[var(--color-secondary)] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={timeLeft}
            aria-valuemin={0}
            aria-valuemax={30}
          >
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {!revealed ? (
          <div className="w-full max-w-xs space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && userAnswer.trim() && handleReveal()
              }
              placeholder={t("answerPlaceholder")}
              aria-label={t("answerPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-secondary)] bg-white/80
                text-[var(--color-primary)] placeholder:text-[var(--color-primary)]/60
                focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
            <button onClick={handleReveal} className="btn w-full">
              {t("submit")}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            <div className={`rounded-2xl px-5 py-4 text-center shadow-[var(--shadow-card)] ${bannerStyles} ${bannerAnimation}`}>
              <p className={`text-3xl font-extrabold mb-1 ${titleColor}`}>
                {resultTitle}
              </p>
              <p className={`text-sm ${subColor}`}>{resultSub}</p>
            </div>

            {isWrong && userAnswer.trim() && (
              <div className="bg-white/80 border-2 border-red-300 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-[var(--color-primary)]/80">{t("yourAnswer")}</p>
                <p className="text-xl font-bold text-red-600 line-through">
                  {userAnswer}
                </p>
              </div>
            )}

            <div
              className={`bg-white/80 rounded-xl px-4 py-3 text-center border-2 ${
                isCorrect ? "border-green-300" : "border-[var(--color-secondary)]"
              }`}
            >
              <p className="text-sm text-[var(--color-primary)]/80">{t("correctAnswer")}</p>
              <p className="text-xl font-bold text-green-700">{meaning}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="btn flex-1 bg-[var(--color-secondary)] text-[var(--color-primary)]"
              >
                {t("back")}
              </button>
              <button onClick={handleReset} className="btn flex-1">
                {t("retry")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
