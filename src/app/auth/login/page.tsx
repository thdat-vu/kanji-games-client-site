import { LoginButton } from "@/components/features/auth/LoginButton";

export const metadata = {
  title: "Đăng nhập | Kanji Games",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white/80 rounded-2xl shadow-[0_8px_32px_#79696222] p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-2">
          Đăng nhập Kanji Games
        </h1>
        <p className="text-sm text-center text-[#796962cc] mb-4">
          Đăng nhập để lưu tiến trình học Kanji của bạn.
        </p>
        <LoginButton />
      </div>
    </div>
  );
}

