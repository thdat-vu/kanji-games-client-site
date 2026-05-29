"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useAuth } from "@/context/auth-context";
import { markWordCorrect } from "@/lib/queries/streak";
import { isAnswerCorrect } from "@/lib/play/answer";
import { isReadingCorrect, displayReadings } from "@/lib/play/reading";
import { gradeStars } from "@/lib/play/stars";
import { StarRow } from "@/components/features/play/StarRow";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { HelpButton } from "@/components/HelpButton";
import { GameOnboardingBanner } from "@/components/features/play/GameOnboardingBanner";
import type { Theme } from "@/constants/themes";
import type { MarkWordCorrectResult } from "@/lib/types/streak";

type GameMode = "meaning" | "reading";interface GameRoundProps {
  kanji: string;
  word: string;
  reading: string;
  meaning: string;
  theme: Theme | null;
  onReadings: string[];
  kunReadings: string[];
}

function WordWithBlankAbove({ word, kanji }: { word: string; kanji: string }) {
  const chars = Array.from(word);
  return (
    <div className="flex items-end justify-center gap-1 pt-10">
      {chars.map((ch, i) => {
        const isTarget = ch === kanji;
        return (
          <span
            key={i}
            className={`relative inline-flex items-center justify-center text-4xl md:text-5xl font-extrabold leading-none ${
              isTarget
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-primary)]/70"
            }`}
          >
            {isTarget && (
              <span
                aria-hidden
                className="absolute -top-9 md:-top-10 left-1/2 -translate-x-1/2 w-12 h-8 md:w-14 md:h-10 rounded-md border-2 border-dashed border-[var(--color-primary)]/60 bg-white/70"
              />
            )}
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export function GameRound({
  kanji,
  word,
  reading,
  meaning,
  theme,
  onReadings,
  kunReadings,
}: GameRoundProps) {
  const router = useRouter();
  const t = useTranslations("play");
  const tc = useTranslations("common");
  const tStreak = useTranslations("play.streak");
  const tMode = useTranslations("play.modeToggle");
  const { user } = useAuth();
  const { timeLeft, percent, expired, started, start, stop, reset } =
    useGameTimer();

  const [mode, setMode] = useState<GameMode | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [streakResult, setStreakResult] =
    useState<MarkWordCorrectResult | null>(null);
  const [submittedTimeLeft, setSubmittedTimeLeft] = useState<number | null>(null);

  const handleReveal = useCallback(() => {
    setSubmittedTimeLeft(timeLeft);
    stop();
    setRevealed(true);
  }, [stop, timeLeft]);

  const handleReset = useCallback(() => {
    setRevealed(false);
    setUserAnswer("");
    setStreakResult(null);
    setSubmittedTimeLeft(null);
    reset();
  }, [reset]);

  const pickMode = useCallback(
    (next: GameMode) => {
      setMode(next);
      handleReset();
      start();
    },
    [handleReset, start]
  );

  const switchMode = useCallback(
    (next: GameMode) => {
      if (next === mode) return;
      setMode(next);
      handleReset();
    },
    [mode, handleReset]
  );

  if (!revealed && started && expired) {
    setRevealed(true);
  }

  const correctAnswerForMode =
    mode === "meaning"
      ? meaning
      : displayReadings(onReadings, kunReadings).join(", ");

  const isCorrect =
    revealed &&
    userAnswer.trim() !== "" &&
    (mode === "meaning"
      ? isAnswerCorrect(userAnswer, meaning)
      : isReadingCorrect(userAnswer, onReadings, kunReadings));

  const isTimedOut = revealed && expired && userAnswer.trim() === "";
  const isWrong = revealed && !isCorrect && !isTimedOut;

  useEffect(() => {
    if (!isCorrect || !user || !theme) return;
    const tz =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const tLeft = submittedTimeLeft ?? 0;
    let cancelled = false;
    markWordCorrect(theme, word, tz, tLeft)
      .then((res) => {
        if (!cancelled && res) setStreakResult(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isCorrect, user, theme, word, submittedTimeLeft]);

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

  const showStreakToast =
    streakResult &&
    (streakResult.streakDelta.kind === "increment" ||
      streakResult.streakDelta.kind === "freeze_used");
  const streakToastText =
    streakResult?.streakDelta.kind === "freeze_used"
      ? tStreak("freezeToast")
      : streakResult
        ? tStreak("incrementToast", { count: streakResult.currentStreak })
        : "";

  const tStars = useTranslations("play.stars");
  const localStars = isCorrect
    ? gradeStars(submittedTimeLeft ?? 0, true)
    : 0;
  const displayStars = (streakResult?.stars ?? localStars) as 0 | 1 | 2 | 3;

  const placeholder =
    mode === "meaning" ? t("answerPlaceholder") : t("readingPlaceholder");

  const readingsAvailable = onReadings.length + kunReadings.length > 0;

  return (
    <div className="min-h-screen text-[var(--color-text)] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6 max-w-5xl mx-auto w-full">
        <div className="bg-white/70 border-2 border-[var(--color-primary)] rounded-xl px-3 py-1 shadow-[var(--shadow-soft)]">
          <p className="text-[10px] text-[var(--color-primary)]/80">
            {tc("kanjiBadge")}
          </p>
          <p className="text-2xl font-bold text-[var(--color-accent)] leading-tight">
            {kanji}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HelpButton screen="game" />
          <LocaleSwitcher />
          <button
            onClick={() => router.back()}
            aria-label={t("back")}
            className="w-8 h-8 rounded-full bg-[var(--window-close)] text-white font-bold text-sm flex items-center justify-center
              hover:brightness-110 transition shadow-[var(--shadow-soft)]"
          >
            ×
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10 md:pb-14 gap-6 md:gap-8">
        {mode === null ? (
          <div className="w-full max-w-md flex flex-col items-center gap-5 text-center">
            <GameOnboardingBanner />
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">
              {tMode("pickPrompt")}
            </h2>
            <p className="text-sm text-[var(--color-primary)]/70">
              {tMode("pickHint")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
              <button
                onClick={() => pickMode("meaning")}
                className="bg-white/80 border-2 border-[var(--color-secondary)] rounded-2xl px-6 py-6 shadow-[var(--shadow-soft)]
                  hover:border-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0
                  transition flex flex-col items-center gap-2"
              >
                <Image
                  src="/assets/icons/meaning.png"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
                <span className="text-base font-bold text-[var(--color-primary)]">
                  {tMode("meaning")}
                </span>
                <span className="text-xs text-[var(--color-primary)]/70">
                  {tMode("meaningDesc")}
                </span>
              </button>
              <button
                onClick={() => pickMode("reading")}
                disabled={!readingsAvailable}
                className="bg-white/80 border-2 border-[var(--color-secondary)] rounded-2xl px-6 py-6 shadow-[var(--shadow-soft)]
                  hover:border-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0
                  transition flex flex-col items-center gap-2
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-secondary)] disabled:hover:translate-y-0"
              >
                <Image
                  src="/assets/icons/reading.png"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
                <span className="text-base font-bold text-[var(--color-primary)]">
                  {tMode("reading")}
                </span>
                <span className="text-xs text-[var(--color-primary)]/70">
                  {tMode("readingDesc")}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
        <div
          role="tablist"
          aria-label={tMode("ariaLabel")}
          className="inline-flex items-center bg-white/70 border-2 border-[var(--color-secondary)] rounded-full p-1 shadow-[var(--shadow-soft)]"
        >
          {(["meaning", "reading"] as const).map((m) => {
            const active = mode === m;
            const disabled = m === "reading" && !readingsAvailable;
            return (
              <button
                key={m}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => switchMode(m)}
                className={`px-4 py-1.5 text-xs md:text-sm font-bold rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-soft)]"
                    : "text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/40"
                }`}
              >
                {tMode(m)}
              </button>
            );
          })}
        </div>

        <div className="bg-white/70 border-2 border-[var(--color-secondary)] rounded-2xl shadow-[var(--shadow-card)] px-8 py-6 md:px-12 md:py-8 w-full max-w-xs md:max-w-md text-center space-y-2">
          {mode === "meaning" ? (
            <>
              <p className="text-lg md:text-xl text-[var(--color-primary)]/80">{reading}</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary)]">
                {word}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-[var(--color-primary)]/60">
                {t("readingHint")}
              </p>
              <WordWithBlankAbove word={word} kanji={kanji} />
              {revealed && (
                <p className="text-lg md:text-xl text-[var(--color-primary)]/80">
                  {reading}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 w-full max-w-xs md:max-w-md">
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
          <div className="w-full max-w-xs md:max-w-md space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && userAnswer.trim() && handleReveal()
              }
              placeholder={placeholder}
              aria-label={placeholder}
              lang={mode === "reading" ? "ja" : undefined}
              inputMode={mode === "reading" ? "text" : undefined}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-secondary)] bg-white/80
                text-[var(--color-primary)] placeholder:text-[var(--color-primary)]/60
                focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition"
            />
            <button onClick={handleReveal} className="btn w-full">
              {t("submit")}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xs md:max-w-md space-y-4">
            <div className={`rounded-2xl px-5 py-4 text-center shadow-[var(--shadow-card)] ${bannerStyles} ${bannerAnimation}`}>
              <p className={`text-3xl font-extrabold mb-1 ${titleColor}`}>
                {resultTitle}
              </p>
              <p className={`text-sm ${subColor}`}>{resultSub}</p>
              {isCorrect && (
                <div className="mt-3 space-y-1">
                  <StarRow earned={displayStars} />
                  {streakResult?.isNewBest ? (
                    <p className="text-xs font-bold text-amber-600 animate-[successPulse_0.5s_ease-out]">
                      {tStars("newBest")}
                    </p>
                  ) : streakResult && streakResult.bestStars > 0 ? (
                    <p className="text-xs text-[var(--color-primary)]/70">
                      {tStars("best", { count: streakResult.bestStars })}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {isCorrect && streakResult && (
              <div className="bg-white/80 border-2 border-[var(--color-secondary)] rounded-xl px-4 py-3 text-center space-y-2">
                <p className="text-sm text-[var(--color-primary)]/80">
                  {tStreak("lessonProgress", {
                    correct: streakResult.wordsCorrect,
                    threshold: streakResult.threshold,
                  })}
                </p>
                <div
                  className="w-full h-2 bg-[var(--color-secondary)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.min(streakResult.wordsCorrect, streakResult.threshold)}
                  aria-valuemin={0}
                  aria-valuemax={streakResult.threshold}
                >
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (streakResult.wordsCorrect / streakResult.threshold) * 100)}%`,
                    }}
                  />
                </div>
                {streakResult.lessonJustCompleted && (
                  <p className="text-base font-bold text-green-700">
                    {tStreak("lessonComplete")}
                  </p>
                )}
                {showStreakToast && (
                  <p className="text-sm font-bold text-[var(--color-accent)] animate-[successPulse_0.5s_ease-out]">
                    {streakToastText}
                  </p>
                )}
              </div>
            )}

            {isCorrect && !user && theme && (
              <div className="bg-white/80 border-2 border-[var(--color-secondary)] rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-[var(--color-primary)]/80">
                  {tStreak("loginPrompt")}
                </p>
              </div>
            )}

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
              <p className="text-xl font-bold text-green-700">{correctAnswerForMode}</p>
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
          </>
        )}
      </main>
    </div>
  );
}
