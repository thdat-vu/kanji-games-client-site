"use client";

import { useTranslations } from "next-intl";
import type { Stars } from "@/lib/play/stars";

interface StarRowProps {
  earned: Stars;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function StarRow({ earned, size = "md" }: StarRowProps) {
  const t = useTranslations("play.stars");
  return (
    <div
      className={`flex items-center justify-center gap-2 ${sizeMap[size]}`}
      role="img"
      aria-label={t("ariaLabel", { count: earned })}
    >
      {[1, 2, 3].map((slot) => {
        const filled = earned >= slot;
        return (
          <span
            key={slot}
            aria-hidden="true"
            className={`inline-block transition-transform ${
              filled
                ? "text-amber-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.1)]"
                : "text-stone-300"
            } ${filled ? "animate-[successPulse_0.5s_ease-out]" : ""}`}
            style={filled ? { animationDelay: `${(slot - 1) * 120}ms` } : undefined}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
