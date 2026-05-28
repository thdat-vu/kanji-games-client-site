"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function UserMenu() {
  const { user } = useAuth();
  const t = useTranslations("auth");
  const tHome = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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

  if (!user) return null;

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    tHome("guestName");
  const email = user.email ?? "";
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setOpen(false);
    setSigningOut(false);
    router.replace(pathname);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("menuLabel")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/80 border-2 border-[var(--color-secondary)] pl-1 pr-3 py-1 shadow-[var(--shadow-soft)] hover:border-[var(--color-primary)] transition-colors"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline text-xs md:text-sm font-semibold text-[var(--color-primary)] max-w-[120px] truncate">
          {displayName}
        </span>
        <span className="text-[var(--color-primary)]/60 text-xs" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border-2 border-[var(--color-secondary)] bg-white shadow-[var(--shadow-card)] overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
        >
          <div className="px-4 py-3 border-b border-[var(--color-secondary)]/60">
            <p className="text-sm font-bold text-[var(--color-primary)] truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-xs text-[var(--color-primary)]/70 truncate">
                {email}
              </p>
            )}
          </div>
          <button
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/40 transition-colors disabled:opacity-60"
          >
            {signingOut ? t("signingOut") : t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
