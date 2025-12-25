import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReviewBoost - Banjir Review Bintang 5",
  description: "Aplikasi pengumpul review otomatis untuk UMKM Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>
        {/* NAVBAR SUDAH DIHAPUS DARI SINI BIAR GAK MUNCUL DI DASHBOARD */}
        {children}
      </body>
    </html>
  );
}