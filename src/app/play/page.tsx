"use client";

import Link from "next/link";
import { KanjiSelector } from "@/components/features/play/KanjiSelector";

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          Kanji<span className="text-[var(--color-secondary)]">Games</span>
        </Link>
      </header>

      <KanjiSelector />
    </div>
  );
}
