import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LessonSelector } from "@/components/features/play/LessonSelector";
import { listThemes } from "@/lib/queries/kanji";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tc = await getTranslations({ locale, namespace: "common" });

  const lessons = await listThemes();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold tracking-wider text-[var(--color-primary)] no-underline"
        >
          {tc("appName")}
        </Link>
      </header>

      <LessonSelector lessons={lessons} />
    </div>
  );
}
