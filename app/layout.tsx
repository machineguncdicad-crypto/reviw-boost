import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import FloatingCS from "@/components/FloatingCS";

// 👇 1. IMPORT TOASTER DARI REACT-HOT-TOAST
import { Toaster } from "react-hot-toast";

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
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <FloatingCS />
            
            {/* 👇 2. PASANG TOASTER DI SINI BIAR MUNCUL DI SEMUA HALAMAN */}
            <Toaster 
              position="top-center" 
              toastOptions={{
                style: {
                  background: '#18181b', // Warna dark mode biar nyatu sama tema lu
                  color: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #27272a'
                }
              }} 
            />
        </ThemeProvider>
      </body>
    </html>
  );
}