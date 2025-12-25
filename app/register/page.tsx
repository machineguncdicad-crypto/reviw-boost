import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 text-white selection:bg-yellow-500/30">
      
      {/* Tombol Balik - Posisi Normal (Top-8) karena Navbar Global udah hilang */}
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
            <Rocket size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Siap Banjir Orderan? 
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Buat akun dalam 30 detik. Gratis, tanpa kartu kredit.
          </p>
        </div>

        <div className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Nama Brand / Toko
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Contoh: Kopi Senja"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email Owner
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="boss@kopi-senja.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Link 
            href="/dashboard"
            className="flex w-full justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-3 text-sm font-bold text-black shadow-lg transition-all hover:shadow-yellow-500/20 hover:scale-[1.02]"
          >
           Daftar Sekarang
          </Link>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Udah punya akun?{' '}
          <Link href="/login" className="font-semibold text-yellow-500 hover:text-yellow-400">
            Masuk Sini
          </Link>
        </p>
      </div>
    </div>
  );
}