import { getTranslations } from "next-intl/server";

export async function AttributionFooter() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t border-[var(--color-secondary)] bg-[var(--color-background)]/80 backdrop-blur-sm px-6 py-8 text-xs leading-relaxed text-[var(--color-primary)]/70">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          {t("dataLine")}
        </p>
        <ul className="flex flex-col items-center gap-2">
          <li>
            <a
              href="https://www.edrdg.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
            >
              {t("edrdg")}
            </a>
          </li>
          <li>
            <a
              href="https://www.unicode.org/charts/unihan.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
            >
              {t("unihan")}
            </a>
          </li>
        </ul>
        <p className="pt-2 text-[var(--color-primary)]/60">{t("license")}</p>
      </div>
    </footer>
  );
}
