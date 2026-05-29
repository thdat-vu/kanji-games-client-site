"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_FLAGS: Record<string, { src: string; key: "vi" | "en" }> = {
  vi: { src: "/assets/icons/vietnam-flag.png", key: "vi" },
  en: { src: "/assets/icons/england-flag.png", key: "en" },
};

export function LocaleSwitcher() {
  const t = useTranslations("common.localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LOCALE_FLAGS[locale] ?? LOCALE_FLAGS.vi;

  function switchLocale(next: string) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/80 border-2 border-[var(--color-secondary)] pl-1 pr-3 py-1 shadow-[var(--shadow-soft)] hover:border-[var(--color-primary)] transition-colors"
      >
        <Image
          src={current.src}
          alt=""
          width={24}
          height={24}
          className="h-7 w-7 rounded-full object-cover"
        />
        <span className="hidden sm:inline text-xs md:text-sm font-semibold text-[var(--color-primary)]">
          {t(current.key)}
        </span>
        <span className="text-[var(--color-primary)]/60 text-xs" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl border-2 border-[var(--color-secondary)] bg-white shadow-[var(--shadow-card)] overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
        >
          {routing.locales.map((l) => {
            const flag = LOCALE_FLAGS[l];
            const isActive = l === locale;
            return (
              <button
                key={l}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => switchLocale(l)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${
                  isActive
                    ? "bg-[var(--color-secondary)]/40 text-[var(--color-primary)]"
                    : "text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/40"
                }`}
              >
                <Image
                  src={flag.src}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="flex-1">{t(flag.key)}</span>
                {isActive && (
                  <span className="text-[var(--color-accent)]" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
