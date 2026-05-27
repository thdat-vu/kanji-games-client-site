"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";

function Header() {
  const { user, loading } = useAuth();
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <header className="grid grid-cols-3 items-center px-6 pt-6 pb-4 md:flex md:justify-between md:px-12 md:pt-8">
      <div className="text-xl font-bold tracking-wider text-[var(--color-primary)] justify-self-center md:justify-self-auto md:text-2xl">
        {tc("appName")}
      </div>
      <nav className="flex items-center gap-4 justify-self-end md:gap-6">
        {loading ? (
          <span className="text-xs text-[var(--color-primary)]/80 md:text-sm">
            {t("checkingAuth")}
          </span>
        ) : user ? (
          <span className="text-xs text-[var(--color-primary)]/90 md:text-sm">
            {t("greeting")}{" "}
            <span className="font-semibold">
              {user.user_metadata.full_name || user.email || t("guestName")}
            </span>
          </span>
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
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text)] font-sans">
      <Header />

      <main className="flex-1 w-full md:hidden">
        <div className="h-full max-w-[500px] mx-auto px-6 pt-4 pb-24 flex flex-col">
          <section className="flex-1 flex items-end justify-center pb-4">
            <Image
              src="/assets/images/avatar.jpeg"
              alt={t("mascotAlt")}
              width={350}
              height={350}
              className="w-[280px] rounded-3xl shadow-[var(--shadow-card)]"
              priority
            />
          </section>
          <section className="pt-4 text-center">
            <h1 className="text-3xl font-extrabold leading-tight text-[var(--color-primary)]">
              {t("heroTitleStart")}{" "}
              <span className="text-[var(--color-secondary)]">
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
            <span className="text-[var(--color-secondary)]">
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
            src="/assets/images/avatar.jpeg"
            alt={t("mascotAlt")}
            width={350}
            height={350}
            className="w-[350px] rounded-3xl shadow-[var(--shadow-card)]"
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
