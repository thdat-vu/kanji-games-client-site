"use client";

import { Typewriter } from "./Typewriter";

const BRAND_CYCLE = ["Kanjido", "漢字道", "かんじどう", "Hán Tự Đạo"];

export function BrandTypewriter({ className }: { className?: string }) {
  return (
    <Typewriter
      phrases={BRAND_CYCLE}
      typeMs={110}
      holdMs={2200}
      eraseMs={55}
      className={className}
    />
  );
}
