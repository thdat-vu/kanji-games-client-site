"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="grid grid-cols-3 items-center px-6 pt-6 pb-4 md:flex md:justify-between md:px-12 md:pt-8">
      <div className="text-xl font-bold tracking-wider text-[var(--color-primary)] justify-self-center md:justify-self-auto md:text-2xl">
        Kanji<span className="text-[var(--color-secondary)]">Games</span>
      </div>
      <nav className="flex items-center gap-4 justify-self-end md:gap-6">
        {/* <a
          href="#"
          aria-label="Instagram"
          className="text-2xl text-[var(--color-primary)]"
        >
          📸
        </a>
        <a
          href="#"
          aria-label="Facebook"
          className="text-2xl text-[var(--color-primary)]"
        >
          📘
        </a>
        <a
          href="#"
          aria-label="YouTube"
          className="text-2xl text-[var(--color-primary)]"
        >
          ▶️
        </a>
        <div className="h-6 w-px bg-[var(--color-primary)]/30" /> */}
        {loading ? (
          <span className="text-xs text-[var(--color-primary)]/80 md:text-sm">
            Đang kiểm tra đăng nhập...
          </span>
        ) : user ? (
          <span className="text-xs text-[var(--color-primary)]/90 md:text-sm">
            Xin chào,{" "}
            <span className="font-semibold">
              {user.user_metadata.full_name ||
                user.email ||
                "người chơi"}
            </span>
          </span>
        ) : (
          <Link
            href="/auth/login"
            className="hidden md:inline text-xs font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline md:text-sm"
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text)] font-sans">
      {/* Header */}
      <Header />

      {/* Hero Section (Mobile - Duolingo-like layout) */}
      <main className="flex-1 w-full md:hidden">
        <div className="h-full max-w-[500px] mx-auto px-6 pt-4 pb-24 flex flex-col">
          <section className="flex-1 flex items-end justify-center pb-4">
            <Image
              src="/assets/images/avatar.jpeg"
              alt="Linh vật Kanji Games"
              width={350}
              height={350}
              className="w-[280px] rounded-3xl shadow-[0_8px_32px_#79696222]"
              priority
            />
          </section>
          <section className="pt-4 text-center">
            <h1 className="text-3xl font-extrabold leading-tight text-[var(--color-primary)]">
              Vừa chơi vừa học, nhớ lâu{" "}
              <span className="text-[var(--color-secondary)]">vượt trội</span>.
            </h1>
          </section>
        </div>
      </main>

      {/* Hero Section (Desktop) */}
      <main className="hidden md:flex flex-1 flex-row items-center justify-center px-12 py-8 gap-12">
        <section className="max-w-[560px]">
          <h1 className="text-[3.5rem] font-extrabold leading-tight text-[var(--color-primary)]">
            Vừa chơi vừa học, nhớ lâu{" "}
            <span className="text-[var(--color-secondary)]">vượt trội</span>.
          </h1>
          <div className="mt-8">
            <Link href="/play" className="btn no-underline">
              Chơi ngay
            </Link>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Image
            src="/assets/images/avatar.jpeg"
            alt="Linh vật Kanji Games"
            width={350}
            height={350}
            className="w-[350px] rounded-3xl shadow-[0_8px_32px_#79696222]"
            priority
          />
        </section>
      </main>

      <div className="md:hidden sticky bottom-0 w-full px-6 pb-6 pt-3 bg-[var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background)]/80">
        <div className="flex flex-col gap-3">
          <Link href="/play" className="btn no-underline w-full text-center block">
            Chơi ngay
          </Link>

          {!loading && !user && (
            <Link
              href="/auth/login"
              className="w-full text-center block rounded-full border-2 border-[var(--color-primary)]/40 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] bg-transparent hover:border-[var(--color-primary)]/60"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
