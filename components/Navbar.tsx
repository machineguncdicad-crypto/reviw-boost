"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 👈 Kita pake Image lagi
import { Menu, X, PlayCircle } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      
      {/* Efek Petir/Denyut Halus (Opsional) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(245,158,11,0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px rgba(245,158,11,0.8)); transform: scale(1.02); }
        }
        .logo-glowing {
           /* Default Glow (Nyala Biasa) */
           filter: drop-shadow(0 0 10px rgba(245,158,11,0.5)); 
           transition: all 0.3s ease;
        }
        .logo-glowing:hover {
           /* Pas di-Hover makin nyala & berdenyut */
           animation: subtle-glow 2s infinite;
        }
      `}} />

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* --- LOGO IMAGE DENGAN EFEK GLOWING --- */}
          <Link href="/" className="relative group block">
            <div className="logo-glowing">
                <Image 
                  src="/reviewboost.png" 
                  alt="ReviewBoost Logo" 
                  width={160} 
                  height={45} 
                  className="h-10 w-auto object-contain" // Ukuran disesuaikan
                  priority 
                  unoptimized 
                />
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Fitur</Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Harga</Link>
            <Link href="#demo" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors flex items-center gap-2">
                <PlayCircle size={16} /> Cara Kerja
            </Link>
          </div>

          {/* AUTH BUTTONS */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/login" className="text-sm font-medium text-white hover:text-yellow-500 transition-colors">Masuk</Link>
            <Link href="/register" className="rounded-full border border-yellow-500 px-5 py-2 text-sm font-bold text-yellow-500 transition-all hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)]">
              Daftar Gratis
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 hover:text-white">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-zinc-900 border-b border-zinc-800 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 shadow-2xl">
             <Link href="#features" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">Fitur</Link>
             <Link href="#pricing" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">Harga</Link>
             <Link href="#demo" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white flex items-center gap-2">
                <PlayCircle size={16} /> Cara Kerja
             </Link>
             <div className="h-px bg-zinc-800 my-2"></div>
             <Link href="/login" className="text-center py-2 text-white font-bold">Masuk</Link>
             <Link href="/register" className="text-center py-2 bg-yellow-500 text-black font-bold rounded-lg">Daftar Gratis</Link>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;