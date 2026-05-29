import { getTranslations } from "next-intl/server";

const SOURCES = [
  {
    href: "https://www.edrdg.org/",
    labelKey: "edrdg",
    short: "JMdict & KANJIDIC2",
  },
  {
    href: "https://www.unicode.org/charts/unihan.html",
    labelKey: "unihan",
    short: "Unicode Unihan",
  },
] as const;

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden="true"
      className="shrink-0"
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.12 3.04.74.8 1.18 1.82 1.18 3.07 0 4.39-2.7 5.36-5.27 5.64.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.17 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export async function AttributionFooter() {
  const t = await getTranslations("footer");
  const repoUrl = process.env.GITHUB_REPO_URL?.trim() || null;
  const authorUrl = process.env.GITHUB_AUTHOR?.trim() || null;

  return (
    <footer className="border-t border-[var(--color-secondary)]/60 bg-[var(--color-background)]/80 backdrop-blur-sm text-[11px] leading-relaxed text-[var(--color-primary)]/70">
      <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]/80">
            {t("dataLine")}
          </span>
          {SOURCES.map((src, i) => (
            <span key={src.href} className="inline-flex items-center gap-2">
              <a
                href={src.href}
                target="_blank"
                rel="noopener noreferrer"
                title={t(src.labelKey)}
                className="underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
              >
                {src.short}
              </a>
              {i < SOURCES.length - 1 && (
                <span aria-hidden className="text-[var(--color-primary)]/40">
                  ·
                </span>
              )}
            </span>
          ))}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t("license")}</span>
          <span aria-hidden className="text-[var(--color-primary)]/40">
            ·
          </span>
          <span className="inline-flex items-center gap-1">
            <span>{t("developedBy")}</span>
            {authorUrl ? (
              <a
                href={authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--color-primary)]/90 underline underline-offset-2 hover:text-[var(--color-accent)] transition-colors"
              >
                {t("authorName")}
              </a>
            ) : (
              <span className="font-semibold text-[var(--color-primary)]/90">
                {t("authorName")}
              </span>
            )}
            <span className="text-[var(--color-primary)]/60">
              {t("authorReading")}
            </span>
          </span>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("github")}
              title={t("github")}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/40 transition"
            >
              <GitHubMark />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
