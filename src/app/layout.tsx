import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter/vietnamese.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Kanji Games, vui trước học sau, nhớ lâu vượt trội",
  description: "Kanji Games, vui trước học sau, nhớ lâu vượt trội",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
