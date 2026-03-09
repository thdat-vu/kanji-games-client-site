"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

function GameRound() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const kanji = searchParams.get("kanji") ?? "";
  const word = searchParams.get("word") ?? "";
  const reading = searchParams.get("reading") ?? "";
  const meaning = searchParams.get("meaning") ?? "";

  const TIMER_SECONDS = 30;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    if (revealed) return;
    if (timeLeft <= 0) {
      setRevealed(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, revealed]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  const isCorrect =
    revealed && userAnswer.trim() !== "" &&
    normalize(meaning)
      .split(",")
      .some((part) => normalize(userAnswer) === normalize(part));

  const isTimedOut = revealed && timeLeft <= 0 && userAnswer.trim() === "";
  const isWrong = revealed && !isCorrect && !isTimedOut;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="bg-[#F5EEE6] border-2 border-[var(--color-primary)] rounded-xl px-3 py-1 shadow">
          <p className="text-[10px] text-[var(--color-primary)]">漢字</p>
          <p className="text-2xl font-bold text-red-800 leading-tight">
            {kanji}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-[#c0392b] text-white font-bold text-sm flex items-center justify-center
            hover:bg-red-700 transition-colors shadow"
        >
          X
        </button>
      </header>

      {/* Main card area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Word card */}
        <div className="bg-[#F5EEE6] border-2 border-[var(--color-secondary)] rounded-2xl shadow-lg px-8 py-6 w-full max-w-xs text-center space-y-2">
          <p className="text-lg text-[var(--color-primary)]">{reading}</p>
          <p className="text-4xl font-extrabold text-[var(--color-primary)]">
            {word}
          </p>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="text-lg font-bold tabular-nums">
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--color-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Answer area */}
        {!revealed ? (
          <div className="w-full max-w-xs space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && userAnswer.trim() && handleReveal()}
              placeholder="Nhập nghĩa tiếng Việt..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-secondary)] bg-white/80
                text-[var(--color-primary)] placeholder:text-[#796962aa] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleReveal}
              className="btn w-full"
            >
              Trả lời
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            {/* Result banner */}
            <div
              className={`rounded-2xl px-5 py-4 text-center shadow-md ${
                isCorrect
                  ? "bg-green-100 border-2 border-green-400"
                  : isTimedOut
                    ? "bg-amber-100 border-2 border-amber-400"
                    : "bg-red-100 border-2 border-red-400"
              }`}
            >
              <p
                className={`text-3xl font-extrabold mb-1 ${
                  isCorrect
                    ? "text-green-600"
                    : isTimedOut
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {isCorrect ? "Chính xác!" : isTimedOut ? "Hết giờ!" : "Sai rồi!"}
              </p>
              <p
                className={`text-sm ${
                  isCorrect
                    ? "text-green-700"
                    : isTimedOut
                      ? "text-amber-700"
                      : "text-red-700"
                }`}
              >
                {isCorrect
                  ? "Bạn giỏi lắm, tiếp tục nhé!"
                  : isTimedOut
                    ? "Bạn chưa kịp trả lời."
                    : "Đừng nản, thử lại nhé!"}
              </p>
            </div>

            {/* User's answer (if wrong) */}
            {isWrong && userAnswer.trim() && (
              <div className="bg-white/80 border-2 border-red-300 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-[#796962cc]">Câu trả lời của bạn</p>
                <p className="text-xl font-bold text-red-600 line-through">
                  {userAnswer}
                </p>
              </div>
            )}

            {/* Correct answer (always shown) */}
            <div
              className={`bg-white/80 rounded-xl px-4 py-3 text-center border-2 ${
                isCorrect ? "border-green-300" : "border-[var(--color-secondary)]"
              }`}
            >
              <p className="text-sm text-[#796962cc]">Đáp án đúng</p>
              <p className="text-xl font-bold text-green-700">{meaning}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="btn flex-1 bg-[var(--color-secondary)] text-[var(--color-primary)]"
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  setRevealed(false);
                  setUserAnswer("");
                  setTimeLeft(TIMER_SECONDS);
                }}
                className="btn flex-1"
              >
                Chơi lại
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
          Đang tải...
        </div>
      }
    >
      <GameRound />
    </Suspense>
  );
}
