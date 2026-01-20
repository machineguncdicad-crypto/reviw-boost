import { NextResponse } from 'next/server';
import axios from 'axios'; // 👈 KITA PAKE KURIR BARU

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;

    // 👇 PAKE DATA DARI APP BARU (ReviewBoost V2)
    const APP_ID = "72b814c6-9bef-42b8-9fd6-1778f59e6537";
    // 👇 PAKE KUNCI V2 YANG LU DAPET BARUSAN
    const API_KEY = "os_v2_app_ok4bjru355blrh6wc54plhtfg6wvuwafa5buikvdpnmookgdqnft72yfvulx7dm6fjf2mdy6v3s7lusdppcnap4ovtej4kuwq7wwr5a";

    console.log("🚀 [AXIOS] KIRIM NOTIF PAKE APP BARU...");

    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // 📦 PAKET DATA
    const payload = {
      app_id: APP_ID,
      // ⚠️ PERHATIAN: ID Laptop lu (fca17...) ITU PUNYA APP LAMA.
      // Di App Baru, ID lu bakal beda.
      // Buat tes nembus 403 dulu, kita pake 'included_segments' biar nyebar ke semua user di App Baru
      included_segments: ["Total Subscriptions"], 
      target_channel: "push",
      headings: { en: title },
      contents: { en: messageContent }
    };

    // 🔫 TEMBAK PAKE AXIOS (Header 'Key' bakal dijaga ketat)
    const response = await axios.post(
      'https://api.onesignal.com/notifications',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${API_KEY}` // Header V2
        }
      }
    );

    console.log("✅ STATUS AXIOS:", response.status);
    console.log("📄 DATA:", JSON.stringify(response.data));

    return NextResponse.json({ success: true, data: response.data });

  } catch (error: any) {
    // Kalau Axios Error, kita bongkar isinya
    const status = error.response?.status || 500;
    const data = error.response?.data || error.message;
    
    console.error("❌ AXIOS ERROR:", status, JSON.stringify(data));
    return NextResponse.json({ success: false, error: data }, { status: status });
  }
}