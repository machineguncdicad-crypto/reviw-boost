"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Star, Settings, LogOut, Rocket, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Ringkasan Toko", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Review Masuk", icon: Star, href: "/dashboard/reviews" },
    { name: "Profil Juragan", icon: User, href: "/dashboard/profile" },
    { name: "Pengaturan", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-yellow-500/30">
      
      {/* SIDEBAR KIRI (FIXED) */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-zinc-950/50 backdrop-blur-xl hidden md:block">
        <div className="flex h-full flex-col">
          
          {/* Logo Area */}
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-black">
                <Rocket size={18} />
              </div>
              <span>ReviewBoost</span>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-1 px-4 py-6">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Menu Utama</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Bottom Sidebar (User) */}
          <div className="border-t border-white/10 p-4">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-900 p-3 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-700 flex items-center justify-center font-bold text-black">
                J
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-white">Juragan Kopi</p>
                <p className="truncate text-xs text-zinc-500">Free Plan</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-black py-2 text-sm text-zinc-400 transition-colors hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500"
            >
              <LogOut size={16} /> Keluar
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 md:ml-64">
        {/* Mobile Header (Hanya muncul di HP) */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-black">
              <Rocket size={18} />
            </div>
            <span>ReviewBoost</span>
          </div>
          <button className="text-zinc-400">
            <Settings size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}