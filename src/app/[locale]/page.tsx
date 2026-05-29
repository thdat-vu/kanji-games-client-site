"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { HomeStreakStrip } from "@/components/features/streak/HomeStreakStrip";
import { UserMenu } from "@/components/features/auth/UserMenu";

function Header() {
  const { user, loading } = useAuth();
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <header className="grid grid-cols-3 items-center px-6 pt-6 pb-4 md:flex md:justify-between md:px-12 md:pt-8 md:max-w-5xl md:mx-auto md:w-full">
      <div className="text-xl font-bold tracking-wider text-[var(--color-primary)] justify-self-center md:justify-self-auto md:text-2xl">
        {tc("appName")}
      </div>
      <nav className="flex items-center gap-4 justify-self-end md:gap-6">
        {loading ? (
          <span className="text-xs text-[var(--color-primary)]/80 md:text-sm">
            {t("checkingAuth")}
          </span>
        ) : user ? (
          <UserMenu />
        ) : (
          <Link
            href="/auth/login"
            className="hidden md:inline text-xs font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline md:text-sm"
          >
            {t("ctaLogin")}
          </Link>
        )}
      </nav>
    </header>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const t = useTranslations("home");

  return (
    <div className="relative min-h-screen flex flex-col text-[var(--color-text)] font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/landinghero_kanjido.png')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[var(--color-background)]/55 md:bg-gradient-to-r md:from-[var(--color-background)]/90 md:via-[var(--color-background)]/70 md:to-[var(--color-background)]/30"
      />
      <Header />
      <HomeStreakStrip />

      <main className="flex-1 w-full md:hidden">
        <div className="h-full max-w-[500px] mx-auto px-6 pt-4 pb-24 flex flex-col">
          <section className="flex-1 flex items-end justify-center pb-4">
            <Image
              src="/assets/images/mascot.png"
              alt={t("mascotAlt")}
              width={760}
              height={1042}
              className="w-[240px] h-auto drop-shadow-[0_8px_32px_rgba(121,105,98,0.18)]"
              priority
            />
          </section>
          <section className="pt-4 text-center">
            <h1 className="text-3xl font-extrabold leading-tight text-[var(--color-primary)]">
              {t("heroTitleStart")}{" "}
              <span className="text-[var(--color-accent)]">
                {t("heroTitleHighlight")}
              </span>
              .
            </h1>
          </section>
        </div>
      </main>

      <main className="hidden md:flex flex-1 flex-row items-center justify-center px-12 py-8 gap-12">
        <section className="max-w-[560px]">
          <h1 className="text-[3.5rem] font-extrabold leading-tight text-[var(--color-primary)]">
            {t("heroTitleStart")}{" "}
            <span className="text-[var(--color-accent)]">
              {t("heroTitleHighlight")}
            </span>
            .
          </h1>
          <div className="mt-8">
            <Link href="/play" className="btn no-underline">
              {t("ctaPlay")}
            </Link>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Image
            src="/assets/images/mascot.png"
            alt={t("mascotAlt")}
            width={760}
            height={1042}
            className="w-[320px] h-auto drop-shadow-[0_12px_40px_rgba(121,105,98,0.2)]"
            priority
          />
        </section>
      </main>

      <div className="md:hidden sticky bottom-0 w-full px-6 pb-6 pt-3 bg-[var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background)]/80">
        <div className="flex flex-col gap-3">
          <Link href="/play" className="btn no-underline w-full text-center block">
            {t("ctaPlay")}
          </Link>

          {!loading && !user && (
            <Link
              href="/auth/login"
              className="w-full text-center block rounded-full border-2 border-[var(--color-primary)]/40 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] bg-transparent hover:border-[var(--color-primary)]/60"
            >
              {t("ctaLogin")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
