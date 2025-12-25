"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Rocket } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
              <Rocket size={20} />
            </div>
            <span>ReviewBoost</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Fitur</Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Harga</Link>
            {/* INI KITA UBAH JADI #testimonials */}
            <Link href="#testimonials" className="text-sm font-medium text-zinc-400 hover:text-yellow-500 transition-colors">Testimoni</Link>
          </div>

          {/* Buttons Area */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/login" className="text-sm font-medium text-white hover:text-yellow-500 transition-colors">
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="rounded-full border border-yellow-500 px-5 py-2 text-sm font-bold text-yellow-500 transition-all hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)]"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 hover:text-white">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;