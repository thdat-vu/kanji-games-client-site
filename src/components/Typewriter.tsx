"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  phrases: string[];
  typeMs?: number;
  eraseMs?: number;
  holdMs?: number;
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  phrases,
  typeMs = 90,
  eraseMs = 45,
  holdMs = 1400,
  className,
  cursorClassName,
}: TypewriterProps) {
  const [mounted, setMounted] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "erase">("type");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mounted || reduced || phrases.length === 0) return;
    const target = phrases[phraseIdx % phrases.length];
    const targetChars = Array.from(target);
    const currentChars = Array.from(text);

    let id: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (currentChars.length < targetChars.length) {
        id = setTimeout(
          () => setText(targetChars.slice(0, currentChars.length + 1).join("")),
          typeMs
        );
      } else {
        id = setTimeout(() => setPhase("hold"), 0);
      }
    } else if (phase === "hold") {
      id = setTimeout(() => setPhase("erase"), holdMs);
    } else {
      if (currentChars.length > 0) {
        id = setTimeout(
          () => setText(currentChars.slice(0, -1).join("")),
          eraseMs
        );
      } else {
        setPhraseIdx((i) => (i + 1) % phrases.length);
        setPhase("type");
        return;
      }
    }
    return () => clearTimeout(id);
  }, [mounted, reduced, text, phase, phraseIdx, phrases, typeMs, eraseMs, holdMs]);

  if (!mounted || reduced) {
    return <span className={className}>{phrases[0] ?? ""}</span>;
  }

  return (
    <span className={className} aria-live="polite">
      <span>{text || " "}</span>
      <span
        aria-hidden
        className={
          cursorClassName ??
          "inline-block w-[2px] h-[0.85em] align-middle ml-0.5 bg-current opacity-70 animate-pulse"
        }
      />
    </span>
  );
}
