export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/assets/images/background_level.png')" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[var(--color-background)]/40" />
      {children}
    </div>
  );
}
