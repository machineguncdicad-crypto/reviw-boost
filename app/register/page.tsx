'use client'

// 1. Wajib import Image biar logo muncul
import Image from 'next/image'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [brandName, setBrandName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !brandName) {
      alert('Waduh, isi semua datanya dulu dong Boss!')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          brand_name: brandName,
        },
      },
    })

    if (error) {
      alert('Gagal Daftar: ' + error.message)
      setLoading(false)
    } else {
      alert('🎉 SIAP! Akun berhasil dibuat. Cek email lu buat verifikasi!')
      router.push('/login')
    }
  }

  return (
    // BACKGROUND UTAMA: Hitam Pekat
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-yellow-500/30">
      
      {/* 1. TOMBOL KEMBALI */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-medium">Kembali</span>
        </Link>
      </div>

      {/* HEADER: LOGO & JUDUL */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 mb-8">
        
        {/* LOGO REVIEWBOOST (MENGGANTIKAN ROKET) */}
        <div className="flex justify-center mb-6">
           <Image
              src="/reviewboost.png" // Menggunakan file logo dari folder public
              alt="Logo ReviewBoost"
              width={180}
              height={60}
              className="object-contain hover:scale-105 transition-transform duration-300"
              priority
            />
        </div>
        
        <h2 className="text-white font-bold text-3xl">
          Siap Banjir Orderan?
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400">
          Buat akun dalam 30 detik. Gratis, tanpa kartu kredit.
        </p>
      </div>

      {/* KOTAK FORM HITAM PEKAT */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-black py-8 px-4 shadow-2xl border border-gray-800 sm:rounded-2xl sm:px-10">
          
          <div className="space-y-5">
            
            {/* INPUT NAMA BRAND */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                NAMA BRAND / TOKO
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-800 rounded-lg bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="Contoh: Kopi Senja"
              />
            </div>

            {/* INPUT EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-800 rounded-lg bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="boss@reviewboost.id"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-800 rounded-lg bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* TOMBOL DAFTAR */}
            <div className="pt-4">
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
              >
                {loading ? 'Lagi Proses...' : 'Daftar Sekarang'}
              </button>
            </div>

          </div>

          {/* FOOTER LINK */}
          <div className="mt-8 text-center">
             <p className="text-sm text-gray-500">
               Sudah punya akun?{' '}
               <Link href="/login" className="font-bold text-yellow-500 hover:text-yellow-400">
                 Login
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}