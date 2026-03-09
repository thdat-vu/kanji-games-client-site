"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="flex justify-between items-center px-12 pt-8 pb-4">
      <div className="text-2xl font-bold tracking-wider text-[var(--color-primary)]">
        Kanji<span className="text-[var(--color-secondary)]">Games</span>
      </div>
      <nav className="flex items-center gap-6">
        <a
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
        <div className="h-6 w-px bg-[var(--color-primary)]/30" />
        {loading ? (
          <span className="text-sm text-[var(--color-primary)]/80">
            Đang kiểm tra đăng nhập...
          </span>
        ) : user ? (
          <span className="text-sm text-[var(--color-primary)]/90">
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
            className="text-sm font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-sans">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex flex-row items-center justify-center px-12 py-8 gap-12 flex-wrap">
        {/* Left: Text */}
        <section className="max-w-[500px]">
          <h1 className="text-[3.5rem] font-extrabold mb-2 leading-tight">
            Chinh phục <span className="text-[var(--color-secondary)]">Kanji</span> <br /> qua Trò Chơi
          </h1>
          <h2 className="text-2xl font-normal text-[var(--color-primary)] mb-6">
            Vừa chơi vừa học, nhớ lâu vượt trội.
          </h2>
          <p className="text-[1.2rem] text-[#796962cc] mb-10">
            Tham gia các trò chơi tương tác giúp bạn làm chủ chữ Kanji tiếng Nhật một cách dễ dàng. Thử thách bản thân, theo dõi tiến trình và biến việc học thành niềm vui!
          </p>
          <a href="#play" className="btn no-underline">
            Chơi ngay
          </a>
        </section>
        {/* Right: Illustration */}
        <section className="min-w-[320px] flex items-center justify-center">
          <Image
            src="/assets/images/avatar.jpeg"
            alt="Linh vật Kanji Games"
            width={350}
            height={350}
            className="rounded-3xl shadow-[0_8px_32px_#79696222]"
            priority
          />
        </section>
      </main>
    </div>
  );
}
