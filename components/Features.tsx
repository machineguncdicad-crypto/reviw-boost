import { MessageCircle, ShieldAlert, TrendingUp } from "lucide-react";

export default function Features() {
  return (
    <section className="bg-black w-full py-20 px-4" id="features">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-10">
        Mengapa Bisnis Anda Butuh Ini?
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow p-8 flex flex-col items-center text-center transition-colors hover:border-fuchsia-500">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-600 to-blue-600 mb-4">
            <MessageCircle size={32} className="text-white" />
          </div>
          <div className="font-semibold text-lg mb-2 text-white">
            Otomatisasi WhatsApp
          </div>
          <div className="text-zinc-400">
            Kirim permintaan review otomatis ke pelanggan setelah transaksi.
          </div>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow p-8 flex flex-col items-center text-center transition-colors hover:border-fuchsia-500">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-600 to-blue-600 mb-4">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div className="font-semibold text-lg mb-2 text-white">
            Filter Review Buruk
          </div>
          <div className="text-zinc-400">
            Cegah bintang 1 muncul di Google. Keluhan pelanggan dialihkan ke chat pribadi.
          </div>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow p-8 flex flex-col items-center text-center transition-colors hover:border-fuchsia-500">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-600 to-blue-600 mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <div className="font-semibold text-lg mb-2 text-white">
            Tingkatkan Ranking SEO
          </div>
          <div className="text-zinc-400">
            Makin banyak review bintang 5, makin mudah bisnis Anda ditemukan di Google.
          </div>
        </div>
      </div>
    </section>
  );
}
