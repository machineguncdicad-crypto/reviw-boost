"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { Menu, X, PlayCircle } from "lucide-react";
// Import Supabase
import { supabase } from "@/lib/supabase";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // 🔥 FUNGSI LOGIN "JURUS MABUK"
  const handleLogin = async () => {
    // KITA PAKSA BALIK KE HOME (URL ASLI)
    // Jangan pake localhost, jangan pake dashboard.
    // Biar script di Home yang ngurus sisanya.
    const siteUrl = "https://reviewboost.vercel.app"; 
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl, // 👈 Balik ke Home
      },
    });
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(245,158,11,0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px rgba(245,158,11,0.8)); transform: scale(1.02); }
        }
        .logo-glowing {
           filter: drop-shadow(0 0 10px rgba(245,158,11,0.5)); 
           transition: all 0.3s ease;
        }
        .logo-glowing:hover {
           animation: subtle-glow 2s infinite;
        }
      `}} />

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          <Link href="/" className="relative group block">
            <div className="logo-glowing">
                <Image 
                  src="/reviewboost.png" 
                  alt="ReviewBoost Logo" 
                  width={160} 
                  height={45} 
                  className="h-10 w-auto object-contain"
                  priority 
                  unoptimized 
                />
            </div>
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Fitur</Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Harga</Link>
            <Link href="#demo" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors flex items-center gap-2">
                <PlayCircle size={16} /> Cara Kerja
            </Link>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            {/* BUTTON LOGIN */}
            <button 
                onClick={handleLogin} 
                className="text-sm font-medium text-white hover:text-yellow-500 transition-colors cursor-pointer"
            >
                Masuk
            </button>
            
            <Link href="/register" className="rounded-full border border-yellow-500 px-5 py-2 text-sm font-bold text-yellow-500 transition-all hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)]">
              Daftar Gratis
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 hover:text-white">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-zinc-900 border-b border-zinc-800 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 shadow-2xl">
             <Link href="#features" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">Fitur</Link>
             <Link href="#pricing" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">Harga</Link>
             <Link href="#demo" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white flex items-center gap-2">
                <PlayCircle size={16} /> Cara Kerja
             </Link>
             <div className="h-px bg-zinc-800 my-2"></div>
             
             <button 
                onClick={() => { handleLogin(); setMobileOpen(false); }} 
                className="text-center py-2 text-white font-bold hover:text-yellow-500"
             >
                Masuk
             </button>

             <Link href="/register" className="text-center py-2 bg-yellow-500 text-black font-bold rounded-lg">Daftar Gratis</Link>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;