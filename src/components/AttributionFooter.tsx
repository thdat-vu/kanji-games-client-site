import { getTranslations } from "next-intl/server";

export async function AttributionFooter() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t border-black/5 bg-[var(--color-background)]/80 px-6 py-6 text-xs leading-relaxed text-[var(--color-text)]/70">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        <p>
          <span className="font-semibold">{t("dataLine")}</span>{" "}
          <a
            href="https://www.edrdg.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-primary)]"
          >
            {t("edrdg")}
          </a>
        </p>
        <p>
          <a
            href="https://www.unicode.org/charts/unihan.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-primary)]"
          >
            {t("unihan")}
          </a>
        </p>
        <p>{t("license")}</p>
      </div>
    </footer>
  );
}
