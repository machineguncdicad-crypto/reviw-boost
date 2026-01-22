import { NextResponse } from 'next/server';
import axios from 'axios'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone } = body;

    // 👇 PANGGIL DARI .ENV (JANGAN DITULIS DISINI LAGI)
    // Pastikan nama variabel ini SAMA PERSIS dengan di .env.local dan Vercel
    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    // Cek dulu kuncinya ada gak (buat debugging di Logs Vercel)
    if (!APP_ID || !API_KEY) {
        console.error("❌ Gawat! Kunci API atau App ID belum di-setting di .env");
        return NextResponse.json({ success: false, error: "Server Configuration Error" }, { status: 500 });
    }

    console.log("🚀 [SERVER] Siap kirim notif...");

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || '-'}"`;

    // 📦 PAKET DATA
    const payload = {
      app_id: APP_ID,
      // Target: Kirim ke SEMUA yang subscribe (Testing)
      included_segments: ["Total Subscriptions"], 
      target_channel: "push",
      headings: { en: title },
      contents: { en: messageContent }
    };

    // 🔫 TEMBAK PAKE AXIOS
    const response = await axios.post(
      'https://api.onesignal.com/notifications',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${API_KEY}` // Kunci masuk sini otomatis
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