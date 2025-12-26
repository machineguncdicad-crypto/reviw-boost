import Image from 'next/image'
import Link from 'next/link'
import { Star, CheckCircle, Zap, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* LOGO (Ukuran disesuaikan) */}
          <div className="flex items-center">
            <Image 
              src="/reviewboost.png" 
              alt="ReviewBoost Logo"
              width={130}             // Dikecilin dikit biar manis
              height={40}
              className="object-contain"
              priority
            />
          </div>

          {/* MENU TENGAH */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-yellow-400 transition-colors">Fitur</a>
            <a href="#testimonials" className="hover:text-yellow-400 transition-colors">Testimoni</a>
            <a href="#pricing" className="hover:text-yellow-400 transition-colors">Harga</a>
          </div>

          {/* TOMBOL KANAN */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-white hover:text-yellow-400 transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-bold shadow-lg shadow-yellow-600/20 hover:scale-105 transition-transform">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Padding & Font Dikecilin) */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-16 text-center">
        <div className="absolute top-0 z-0 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black" />
        
        <div className="z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <span className="mr-2"></span> Secret Tool Para Founder
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
            Bikin Brand Kamu <br />
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Viral & Banjir Review
            </span>
          </h1>
          
          <p className="mx-auto max-w-xl text-base text-zinc-400 sm:text-lg leading-relaxed">
            Platform otomatis buat Klinik Skincare, Coffee Shop, & Local Brand Indonesia. 
            Naikkan rating Google Maps, bikin kompetitor ketar-ketir.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 pt-4">
            <Link 
              href="/register" 
              className="group relative rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-3 text-base font-bold text-black transition-all hover:shadow-[0_0_30px_-10px_rgba(251,191,36,0.5)] hover:scale-105"
            >
              Coba Gratis Sekarang
            </Link>
            <Link href="#pricing" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              Cek Harga Paket <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST SECTION (Compact) */}
      <section className="border-y border-white/5 bg-white/5 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Dipercaya 500+ Local Brand Owner</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            <span className="text-lg font-black text-white">KOPI SENJA</span>
            <span className="text-lg font-black text-white">GLOW.ID</span>
            <span className="text-lg font-black text-white">THRIFT SHOP</span>
            <span className="text-lg font-black text-white">BURGER LOKAL</span>
            <span className="text-lg font-black text-white">CUKUR.IN</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Jarak dirapetin) */}
      <section className="py-16 relative" id="features">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-4xl mb-2 text-white">Tools Wajib Buat Scale-Up </h2>
            <p className="text-base text-zinc-400">Gak jaman lagi minta review manual malu-maluin.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Auto-Chat WhatsApp", desc: "Bot pinter yang bakal sapa customer & minta bintang 5 abis bayar." },
              { icon: Shield, title: "Filter Haters", desc: "Review bintang 1-3 kita tahan dulu, bintang 4-5 langsung gas ke Google Maps." },
              { icon: TrendingUp, title: "Real-time Monitoring", desc: "Pantau performa cabang sambil rebahan lewat dashboard HP." },
            ].map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:border-yellow-500/50 hover:bg-zinc-900 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-zinc-900/30 py-16 border-y border-white/5" id="testimonials">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold sm:text-4xl text-white">Review Para Founder</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Siska", role: "CEO Glow.id", text: "Jujurly ini ngebantu banget. Dulu boncos di iklan, sekarang rame organik gara-gara rating 4.9!" },
              { name: "Bro Dimas", role: "Owner Kopi Senja", text: "Worth it parah. Sebulan pake, review nambah 500 biji. Cabang ke-2 langsung rame." },
              { name: "Sarah", role: "Founder LocalWear", text: "Fitur auto-WA nya smooth banget, gak kaku kayak robot. Customer seneng, kita cuan." },
            ].map((testi, i) => (
              <div key={i} className="relative rounded-2xl bg-black p-6 border border-white/10 hover:border-yellow-500/30 transition-all hover:-translate-y-1">
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="mb-6 text-zinc-300 italic text-sm leading-relaxed">"{testi.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center text-black font-black text-xs border border-black">
                    {testi.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{testi.name}</p>
                    <p className="text-xs text-yellow-500 font-medium">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION (Compact Cards) */}
      <section className="py-16" id="pricing">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-4xl mb-2 text-white">Harga Merakyat, Cuan Melesat </h2>
            <p className="text-base text-zinc-400">Investasi kecil buat impact gede ke bisnismu.</p>
          </div>
          
          <div className="grid gap-6 max-w-5xl mx-auto sm:grid-cols-3 items-center">
            {/* Paket 1 */}
            <div className="rounded-2xl border border-white/10 bg-black p-6 hover:border-white/30 transition-colors">
              <h3 className="text-lg font-bold text-zinc-400">BASSIC</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-3xl font-bold text-white">Rp 99rb</span>
                <span className="ml-1 text-xs text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 flex-shrink-0"/> 100 Review / bulan</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 flex-shrink-0"/> Integrasi G-Maps</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-zinc-600 flex-shrink-0"/> Auto-Chat WhatsApp</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full border border-white/20 py-3 text-center text-sm font-bold hover:bg-white hover:text-black transition-colors">
                Get Bassic Plan
              </Link>
            </div>

            {/* Paket 2 (BEST SELLER) */}
            <div className="relative rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-8 shadow-[0_0_30px_-10px_rgba(234,179,8,0.2)] transform hover:scale-105 transition-transform z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-1 text-[10px] font-black text-black uppercase tracking-widest shadow-lg">
                Recommended
              </div>
              <h3 className="text-xl font-bold text-yellow-500">PRO</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">Rp 199rb</span>
                <span className="ml-1 text-xs text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-white font-medium">
                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-500 flex-shrink-0"/> <span className="text-yellow-200">Unlimited Review</span></li>
                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-500 flex-shrink-0"/> Auto-Chat WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-500 flex-shrink-0"/> Filter Haters (Bintang 1-3)</li>
                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-500 flex-shrink-0"/> Priority Support</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 py-3 text-center text-sm font-black text-black hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
                Get Pro plan
              </Link>
            </div>

            {/* Paket 3 */}
            <div className="rounded-2xl border border-white/10 bg-black p-6 hover:border-white/30 transition-colors">
              <h3 className="text-lg font-bold text-zinc-400">MAX</h3>
              <div className="my-4 flex items-baseline">
                <span className="text-3xl font-bold text-white">Rp 499rb</span>
                <span className="ml-1 text-xs text-zinc-500">/bulan</span>
              </div>
              <ul className="mb-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 flex-shrink-0"/> 5 Cabang Toko</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 flex-shrink-0"/> Full Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 flex-shrink-0"/> Konsultasi Privat</li>
              </ul>
              <Link href="/register" className="block w-full rounded-full border border-white/20 py-3 text-center text-sm font-bold hover:bg-white hover:text-black transition-colors">
                Hubungi Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-xs">© 2025 ReviewBoost. Dibuat dengan rasa keberanian anak muda Indonesia.</p>
        </div>
      </footer>
    </main>
  );
}