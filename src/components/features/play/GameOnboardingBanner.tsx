"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HelpModal } from "@/components/HelpModal";

const KEY = "kanjido_onboarded_game";

export function GameOnboardingBanner() {
  const th = useTranslations("help");
  const [show, setShow] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(KEY) !== "1") setShow(true);
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, "1");
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      <div
        role="region"
        aria-label={th("banner.title")}
        className="w-full max-w-md bg-white/90 border-2 border-[var(--color-primary)] rounded-2xl px-4 py-3 shadow-[var(--shadow-soft)] flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]"
      >
        <p className="text-sm font-bold text-[var(--color-primary)]">
          {th("banner.title")}
        </p>
        <p className="text-xs text-[var(--color-primary)]/80">
          {th("banner.body")}
        </p>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setOpenHelp(true)}
            className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] underline cursor-pointer"
          >
            {th("banner.openCta")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-secondary)] border-2 border-[var(--window-border)] px-3 py-1 shadow-[1px_1px_0_rgba(0,0,0,0.2)] hover:brightness-105 cursor-pointer"
          >
            {th("banner.dismiss")}
          </button>
        </div>
      </div>
      <HelpModal
        open={openHelp}
        onClose={() => {
          setOpenHelp(false);
          dismiss();
        }}
        titleKey="game"
      />
    </>
  );
}
