import { getTranslations } from "next-intl/server";
import { LoginButton } from "@/components/features/auth/LoginButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("loginTitle") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/80 rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-secondary)] p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-2">
          {t("loginHeading")}
        </h1>
        <p className="text-sm text-center text-[var(--color-primary)]/80 mb-4">
          {t("loginSubtitle")}
        </p>
        <LoginButton />
      </div>
    </div>
  );
}
