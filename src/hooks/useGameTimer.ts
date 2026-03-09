import { useState, useEffect, useCallback } from "react";
import { TIMER_SECONDS } from "@/constants/constants";

export function useGameTimer() {
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (expired) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, expired]);

  const stop = useCallback(() => {
    setExpired(true);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    setExpired(false);
  }, []);

  const percent = (timeLeft / TIMER_SECONDS) * 100;

  return { timeLeft, percent, expired, stop, reset };
}
