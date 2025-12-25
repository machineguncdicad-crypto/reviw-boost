import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Star, CheckCircle, Zap, Shield, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:pt-40">
        <div className="absolute top-0 z-0 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black" />
        
        <div className="z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400 backdrop-blur-sm">
            <span className="mr-2">🔥</span> Secret Tool Para Founder
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Bikin Brand Kamu <br />
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Viral & Banjir Review
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Platform otomatis buat Klinik Skincare, Coffee Shop, & Local Brand Indonesia. 
            Naikkan rating Google Maps, bikin kompetitor ketar-ketir.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
            <Link 
              href="/register" 
              className="group relative rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-4 text-lg font-bold text-black transition-all hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)] hover:scale-105"
            >
              Coba Gratis
            </Link>
            <Link href="#pricing" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
              Cek Harga Paket →
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="border-y border-white/5 bg-white/5 py-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-sm font-medium text-zinc-500 tracking-widest">DIPERCAYA 500+ LOCAL BRAND OWNER</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
            <span className="text-xl font-bold text-white">KOPI SENJA</span>
            <span className="text-xl font-bold text-white">GLOW.ID</span>
            <span className="text-xl font-bold text-white">THRIFT SHOP</span>
            <span className="text-xl font-bold text-white">BURGER LOKAL</span>
            <span className="text-xl font-bold text-white">CUKUR.IN</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Tools Wajib Buat Scale-Up </h2>
            <p className="mt-4 text-zinc-400">Gak jaman lagi minta review manual malu-maluin.</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Auto-Chat WhatsApp", desc: "Bot pinter yang bakal sapa customer & minta bintang 5 abis bayar." },
              { icon: Shield, title: "Filter Haters", desc: "Review bintang 1-3 kita tahan dulu, bintang 4-5 langsung gas ke Google Maps." },
              { icon: TrendingUp, title: "Real-time Monitoring", desc: "Pantau performa cabang sambil rebahan lewat dashboard HP." },
            ].map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-8 transition-all hover:border-yellow-500/50 hover:bg-zinc-900 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - NAH INI DIA KITA KASIH ID */}
      <section className="bg-zinc-900/30 py-24" id="testimonials">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Kata Para Founder</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { name: "Siska", role: "CEO Glow.id", text: "Jujurly ini ngebantu banget. Dulu boncos di iklan, sekarang rame organik gara-gara rating 4.9!" },
              { name: "Bro Dimas", role: "Owner Kopi Senja", text: "Worth it parah. Sebulan pake, review nambah 500 biji. Cabang ke-2 langsung rame." },
              { name: "Sarah", role: "Founder LocalWear", text: "Fitur auto-WA nya smooth banget, gak kaku kayak robot. Customer seneng, kita cuan." },
            ].map((testi, i) => (
              <div key={i} className="relative rounded-2xl bg-black p-6 border border-white/10 hover:border-yellow-500/30 transition-colors">
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="mb-6 text-zinc-300 italic">"{testi.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center text-black font-bold text-xs">
                    {testi.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testi.name}</p>
                    <p className="text-xs text-zinc-500">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24" id="pricing">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Harga Merakyat, Cuan Sultan </h2>
            <p className="mt-4 text-zinc-400">Investasi kecil buat impact gede ke bisnismu.</p>
          </div>
          
          <div className="grid gap-8 max-w-5xl mx-auto sm:grid-cols-3">
            {/* Paket 1 */}
            <div className="rounded-3xl border border-white/10 bg-black p-8 hover:border-white/30 transition-colors">
              <h3 className="text-lg font-medium text-zinc-400">Starter Pack</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-3xl font-bold text-white">Rp 99rb</span>
                <span className="ml-2 text-sm text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> 100 Review / bulan</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Integrasi G-Maps</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Standard Support</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full border border-white/20 py-3 text-center text-sm font-bold hover:bg-white hover:text-black transition-colors">
                Normal
              </Link>
            </div>

            {/* Paket 2 (BEST SELLER) */}
            <div className="relative rounded-3xl border border-yellow-500/50 bg-zinc-900 p-8 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)] transform hover:scale-105 transition-transform">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-1 text-xs font-bold text-black">
                Biasa
              </div>
              <h3 className="text-lg font-medium text-yellow-500">Paket Viral</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">Rp 199rb</span>
                <span className="ml-2 text-sm text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-white">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Unlimited Review</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Auto-Chat WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Filter Haters</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Priority Support</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full bg-yellow-500 py-3 text-center text-sm font-bold text-black hover:bg-yellow-400 transition-colors">
                Pilihan
              </Link>
            </div>

            {/* Paket 3 */}
            <div className="rounded-3xl border border-white/10 bg-black p-8 hover:border-white/30 transition-colors">
              <h3 className="text-lg font-medium text-zinc-400">Paket Sultan</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-3xl font-bold text-white">Rp 499rb</span>
                <span className="ml-2 text-sm text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> 5 Cabang Toko</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Full Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500"/> Konsultasi Privat</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full border border-white/20 py-3 text-center text-sm font-bold hover:bg-white hover:text-black transition-colors">
                Chat Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500">© 2025 ReviewBoost. Dibuat dengan  di Indonesia.</p>
        </div>
      </footer>
    </main>
  );
}