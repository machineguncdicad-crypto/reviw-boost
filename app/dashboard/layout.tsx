"use client";

import Link from "next/link";
import Image from "next/image"; 
import { usePathname } from "next/navigation"; 
import { LayoutDashboard, MessageCircle, User, LogOut, Settings, Menu, ChevronRight, Sparkles } from "lucide-react"; 
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation"; 
import { useState } from "react";
import OneSignalInit from "@/components/MyNotif";
import ReputationChart from "@/components/dashboard/ReputationChart"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/"); 
  };

  const menuItems = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inbox Review", href: "/dashboard/reviews", icon: MessageCircle },
    // 🔥 MENU BARU: TestiGen Studio 🔥
    { name: "TestiGen Studio", href: "/dashboard/testimonials", icon: Sparkles },
    { name: "Profil Saya", href: "/dashboard/profile", icon: User },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      
      {/* CSS EFEK PETIR */}
      <style jsx global>{`
        @keyframes lightning {
          0%, 100% { filter: drop-shadow(0 0 0 transparent) brightness(1); }
          50% { filter: drop-shadow(0 0 10px #fbbf24) brightness(1.2); }
          54% { filter: drop-shadow(0 0 5px #fbbf24) brightness(1.2); }
        }
        .electric-logo { animation: lightning 4s infinite; }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #27272a 1px, transparent 1px),
          linear-gradient(to bottom, #27272a 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }
      `}</style>

      {/* --- SIDEBAR (VERSI MAKSA MUNCUL) --- */}
      <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 z-50 shrink-0">
        
        {/* LOGO AREA */}
        <div className="p-6 pb-2 flex justify-center">
           <div className="electric-logo cursor-pointer relative w-full max-w-[160px]">
             <Image 
               src="/reviewboost.png" 
               alt="Logo" 
               width={160}   
               height={50} 
               className="w-full h-auto object-contain"
               priority
             />
           </div>
        </div>

        {/* --- AREA GRAFIK REPUTASI --- */}
        <div className="px-4 mb-2 transform scale-90 origin-top">
            <ReputationChart />
        </div>
        
        {/* NAVIGASI */}
        <div className="flex-1 px-3 space-y-1 overflow-y-auto py-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? "fill-yellow-500/20" : ""}/>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#fbbf24]"></div>}
              </Link>
            );
          })}
        </div>

        {/* PROFILE BOTTOM */}
        <div className="p-4 border-t border-zinc-900 mt-auto">
           <button 
             onClick={handleLogout} 
             disabled={isLoggingOut}
             className="flex items-center justify-between gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 hover:border-red-500/10 border border-transparent rounded-xl transition w-full group"
           >
             <div className="flex items-center gap-2">
                <LogOut size={18} />
                <span className="font-medium text-sm">{isLoggingOut ? "Keluar..." : "Keluar Akun"}</span>
             </div>
           </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 relative h-screen overflow-y-auto bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none fixed"></div>
        
        <OneSignalInit />

        <div className="relative z-10 p-0">
            {children} 
        </div>
      </main>

    </div>
  );
}