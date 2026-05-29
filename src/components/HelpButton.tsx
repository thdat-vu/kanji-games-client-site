"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpModal } from "@/components/HelpModal";

interface HelpButtonProps {
  screen: "play" | "lesson" | "game";
}

export function HelpButton({ screen }: HelpButtonProps) {
  const th = useTranslations("help");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={th("openLabel")}
        title={th("openLabel")}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border-2 border-[var(--color-secondary)] shadow-[var(--shadow-soft)] hover:border-[var(--color-primary)] hover:scale-105 transition cursor-pointer"
      >
        <Image
          src="/assets/icons/reading.png"
          alt=""
          width={22}
          height={22}
          className="h-5 w-5 object-contain"
          aria-hidden="true"
        />
      </button>
      <HelpModal open={open} onClose={() => setOpen(false)} titleKey={screen} />
    </>
  );
}
