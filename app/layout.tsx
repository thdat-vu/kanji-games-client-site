import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter/vietnamese.css";

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
        {children}
      </body>
    </html>
  );
}
