import { Star, TrendingUp, Users, MessageCircle, Share2, QrCode, ArrowUpRight, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      
      {/* HEADER: SAPAAN BOS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Halo, Founder! 👋</h1>
          <p className="text-zinc-400">Ini performa bisnis kamu hari ini. Cuan terus ya!</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            <QrCode size={16} /> QR Toko
          </button>
          <button className="flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 hover:scale-105 transition-all">
            <Share2 size={16} /> Share Link
          </button>
        </div>
      </div>

      {/* STATS CARDS (YANG BIKIN SEMANGAT) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Review */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500">
              <Star size={24} fill="currentColor" />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
              +12% <ArrowUpRight size={12} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-400">Total Bintang 5</p>
            <h3 className="text-3xl font-bold text-white">1,240</h3>
          </div>
          {/* Hiasan background */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-500/10 blur-2xl" />
        </div>

        {/* Card 2: Rating Rata-rata */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <TrendingUp size={24} />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
              Stabil
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-400">Rating Google</p>
            <h3 className="text-3xl font-bold text-white">4.9 <span className="text-lg text-zinc-500">/ 5.0</span></h3>
          </div>
        </div>

        {/* Card 3: Pelanggan Baru */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <Users size={24} />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
              +24 New
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-400">Pelanggan Bulan Ini</p>
            <h3 className="text-3xl font-bold text-white">856</h3>
          </div>
        </div>

        {/* Card 4: WA Terkirim */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
              <MessageCircle size={24} />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
              Auto
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-400">WA Terkirim</p>
            <h3 className="text-3xl font-bold text-white">3,402</h3>
          </div>
        </div>
      </div>

      {/* SECTION 2 KOLOM: GRAFIK & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* KOLOM KIRI: GRAFIK SIMPEL (Pura-pura dulu) */}
        <div className="rounded-3xl border border-white/10 bg-black p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Tren Kepuasan Pelanggan</h3>
            <select className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          
          {/* Visualisasi Grafik Batang Simpel pake CSS */}
          <div className="flex h-64 items-end justify-between gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 75, 60, 85, 95, 80, 100].map((h, i) => (
              <div key={i} className="group relative w-full rounded-t-lg bg-zinc-800 transition-all hover:bg-yellow-500">
                <div 
                  className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-yellow-900/50 to-yellow-500 opacity-80 transition-all group-hover:opacity-100" 
                  style={{ height: `${h}%` }} 
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-zinc-500">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
        </div>

        {/* KOLOM KANAN: LIVE FEED */}
        <div className="rounded-3xl border border-white/10 bg-black p-6">
          <h3 className="mb-6 text-lg font-bold text-white">Baru Saja Masuk 🔥</h3>
          <div className="space-y-6">
            {[
              { name: "Budi Santoso", rating: 5, time: "2 menit lalu", comment: "Pelayanannya ramah banget!" },
              { name: "Siti Aminah", rating: 5, time: "15 menit lalu", comment: "Tempatnya nyaman, kopi enak." },
              { name: "Rudi Hartono", rating: 4, time: "1 jam lalu", comment: "Parkiran agak penuh, tapi oke." },
              { name: "Dewi Lestari", rating: 5, time: "3 jam lalu", comment: "Best skincare in town! ✨" },
            ].map((review, i) => (
              <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-400">
                  {review.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{review.name}</p>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={10}/> {review.time}</span>
                  </div>
                  <div className="my-1 flex text-yellow-500">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-xl border border-zinc-800 py-3 text-sm font-medium text-zinc-400 hover:border-yellow-500 hover:text-white transition-colors">
            Lihat Semua Review
          </button>
        </div>

      </div>
    </div>
  );
}