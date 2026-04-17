import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Pakai Service Role Key biar backend punya akses full ngecek database dengan aman
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!APP_ID || !API_KEY) {
        console.error("❌ Kunci API belum di-setting");
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }

    // --- 1. PROTEKSI API: VALIDASI KE DATABASE ---
    // Jangan asal telan request. Pastikan owner_id ini beneran ada dan terdaftar di DB lu!
    if (!owner_id) {
        return NextResponse.json({ success: false, error: "Missing owner_id" }, { status: 400 });
    }

    const { data: owner, error: dbError } = await supabaseAdmin
        .from('profiles')
        .select('id, subscription_status')
        .eq('id', owner_id)
        .single();

    if (dbError || !owner) {
        console.warn(`🚨 Seseorang mencoba nembak API dengan owner_id palsu: ${owner_id}`);
        return NextResponse.json({ success: false, error: "Invalid Owner ID" }, { status: 403 });
    }

    console.log(`🚀 [SERVER] Memproses notif untuk Owner: ${owner.id}`);

    // --- 2. FORMAT PESAN ---
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})\n💬 "${comment || '-'}"`;

    // --- 3. TARGET SPESIFIK ONESIGNAL ---
    const payload = {
      app_id: APP_ID,
      // ✅ BENAR: Gunakan 'include_aliases' untuk menembak spesifik ke ID Supabase User
      include_aliases: {
          external_id: [owner_id] 
      },
      target_channel: "push",
      headings: { en: title },
      contents: { en: messageContent }
    };

    // Tembak pake Axios
    const response = await axios.post(
      'https://api.onesignal.com/notifications',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${API_KEY}` // Ingat: OneSignal REST API pakai format Basic, bukan Key.
        }
      }
    );

    console.log("✅ SUKSES KIRIM:", response.status);
    return NextResponse.json({ success: true, data: response.data });

  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || error.message;
    console.error("❌ GAGAL KIRIM:", status, JSON.stringify(data));
    return NextResponse.json({ success: false, error: data }, { status: status });
  }
}