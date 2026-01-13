import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// 👇 1. IMPORT KOMPONEN CS YANG BARU KITA BUAT
import FloatingCS from "@/components/FloatingCS";

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
    // suppressHydrationWarning wajib ada biar gak error pas pake ThemeProvider
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {/* Halaman Utama (Landing Page / Dashboard / Login) render disini */}
            {children}

            {/* 👇 2. PASANG DISINI! Biar muncul di SEMUA HALAMAN & ikut tema Dark/Light */}
            <FloatingCS />

        </ThemeProvider>

      </body>
    </html>
  );
}