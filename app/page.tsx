import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", color: "var(--color-text)", fontFamily: "'Inter', Tahoma, Arial, Helvetica, sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2rem 3rem 1rem 3rem" }}>
        <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: 2, color: "var(--color-primary)" }}>
          Kanji<span style={{ color: "var(--color-secondary)" }}>Games</span>
        </div>
        <nav style={{ display: "flex", gap: "1.5rem" }}>
          <a href="#" aria-label="Instagram" style={{ fontSize: 24, color: "var(--color-primary)" }}>📸</a>
          <a href="#" aria-label="Facebook" style={{ fontSize: 24, color: "var(--color-primary)" }}>📘</a>
          <a href="#" aria-label="YouTube" style={{ fontSize: 24, color: "var(--color-primary)" }}>▶️</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: "2rem 3rem", gap: "3rem", flexWrap: "wrap" }}>
        {/* Left: Text */}
        <section style={{ maxWidth: 500 }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "0.5rem", lineHeight: 1.1 }}>
            Chinh phục <span style={{ color: "var(--color-secondary)" }}>Kanji</span> <br /> qua Trò Chơi
          </h1>
          <h2 style={{ fontSize: "2rem", fontWeight: 400, color: "var(--color-primary)", marginBottom: "1.5rem" }}>
            Vừa chơi vừa học, nhớ lâu vượt trội.
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#796962cc", marginBottom: "2.5rem" }}>
            Tham gia các trò chơi tương tác giúp bạn làm chủ chữ Kanji tiếng Nhật một cách dễ dàng. Thử thách bản thân, theo dõi tiến trình và biến việc học thành niềm vui!
          </p>
          <a href="#play" className="btn" style={{ textDecoration: "none" }}>
            Chơi ngay
          </a>
        </section>
        {/* Right: Illustration */}
        <section style={{ minWidth: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image
            src="/assets/images/avatar.jpeg"
            alt="Linh vật Kanji Games"
            width={350}
            height={350}
            style={{ borderRadius: "2rem", boxShadow: "0 8px 32px #79696222" }}
            priority
          />
        </section>
      </main>
    </div>
  );
}
