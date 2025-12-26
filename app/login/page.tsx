'use client'

// 1. Import Image wajib ada
import Image from 'next/image'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Isi email dan password dulu dong Boss!')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Gagal Masuk: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) alert(error.message)
  }

  return (
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
        
        {/* LOGO REVIEWBOOST (GANTIIN ROKET LAMA) */}
        <div className="flex justify-center mb-6">
            <Image
              src="/reviewboost.png" // Pake logo dari folder public
              alt="Logo ReviewBoost"
              width={180}
              height={60}
              className="object-contain hover:scale-105 transition-transform duration-300"
              priority
            />
        </div>
        
        <h2 className="text-white font-bold text-3xl">
          Welcome Back, Founder!
        </h2>
        <p className="mt-3 text-center text-sm text-gray-400">
          Masuk untuk cek performa rating tokomu hari ini.
        </p>
      </div>

      {/* KOTAK FORM */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-black py-8 px-4 shadow-2xl border border-gray-800 sm:rounded-2xl sm:px-10">
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">EMAIL FOUNDER</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-gray-800 rounded-lg bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all" placeholder="juragan@kopi-senja.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-gray-800 rounded-lg bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all" placeholder="••••••••" />
            </div>

            <div className="pt-2">
              <button onClick={handleLogin} disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]">
                {loading ? 'Lagi Masuk...' : 'Masuk'}
              </button>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-black text-gray-500">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            {/* TOMBOL GOOGLE */}
            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-800 rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
             <p className="text-sm text-gray-500">
               Belum punya akun?{' '}
               <Link href="/register" className="font-bold text-yellow-500 hover:text-yellow-400">
                 Daftar Gratis
               </Link>
             </p>
          </div>

        </div>
      </div>
    </div>
  )
}